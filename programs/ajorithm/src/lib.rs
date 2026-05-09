use anchor_lang::prelude::*;

declare_id!("DNxjy5KkrdJsuf9NNRMcdEuiuME1yV9Rxb8ETLJyAV9f");

#[program]
pub mod ajorithm {
    use super::*;

    pub fn create_pact(
        ctx: Context<CreatePact>,
        name: String,
        contribution_amount: u64,
        max_members: u8,
    ) -> Result<()> {
        require!(name.len() <= 32, AjorithmError::NameTooLong);
        require!(max_members >= 2 && max_members <= 10, AjorithmError::InvalidMemberCount);
        require!(contribution_amount > 0, AjorithmError::InvalidAmount);

        let pact = &mut ctx.accounts.pact;
        pact.organizer = ctx.accounts.organizer.key();
        pact.name = name;
        pact.contribution_amount = contribution_amount;
        pact.max_members = max_members;
        pact.current_members = 1;
        pact.current_round = 0;
        pact.total_rounds = max_members;
        pact.is_active = true;
        pact.members = vec![ctx.accounts.organizer.key()];
        pact.payout_order = vec![ctx.accounts.organizer.key()];
        pact.bump = ctx.bumps.pact;

        let reputation = &mut ctx.accounts.organizer_reputation;
        reputation.member = ctx.accounts.organizer.key();
        reputation.contributions_made = 0;
        reputation.contributions_missed = 0;
        reputation.streak = 0;
        reputation.bump = ctx.bumps.organizer_reputation;

        msg!("Pact created: {}", pact.name);
        Ok(())
    }

    pub fn join_pact(ctx: Context<JoinPact>) -> Result<()> {
        let pact = &mut ctx.accounts.pact;

        require!(pact.is_active, AjorithmError::PactNotActive);
        require!(
            pact.current_members < pact.max_members,
            AjorithmError::PactFull
        );
        require!(
            !pact.members.contains(&ctx.accounts.member.key()),
            AjorithmError::AlreadyMember
        );

        pact.members.push(ctx.accounts.member.key());
        pact.payout_order.push(ctx.accounts.member.key());
        pact.current_members += 1;

        let reputation = &mut ctx.accounts.member_reputation;
        reputation.member = ctx.accounts.member.key();
        reputation.contributions_made = 0;
        reputation.contributions_missed = 0;
        reputation.streak = 0;
        reputation.bump = ctx.bumps.member_reputation;

        msg!("Member joined: {}", ctx.accounts.member.key());
        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>) -> Result<()> {
        let pact = &mut ctx.accounts.pact;

        require!(pact.is_active, AjorithmError::PactNotActive);
        require!(
            pact.members.contains(&ctx.accounts.member.key()),
            AjorithmError::NotAMember
        );

        let contribution_amount = pact.contribution_amount;

        // Transfer SOL from member to escrow
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.member.key(),
            &ctx.accounts.escrow.key(),
            contribution_amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.member.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update reputation
        let reputation = &mut ctx.accounts.member_reputation;
        reputation.contributions_made += 1;
        reputation.streak += 1;

        msg!(
            "Contribution received from: {} amount: {}",
            ctx.accounts.member.key(),
            contribution_amount
        );
        Ok(())
    }

    pub fn release_payout(ctx: Context<ReleasePayout>) -> Result<()> {
        let pact = &mut ctx.accounts.pact;

        require!(pact.is_active, AjorithmError::PactNotActive);
        require!(
            ctx.accounts.organizer.key() == pact.organizer,
            AjorithmError::NotOrganizer
        );
        require!(
            (pact.current_round as usize) < pact.payout_order.len(),
            AjorithmError::AllRoundsComplete
        );

        let recipient = pact.payout_order[pact.current_round as usize];
        require!(
            ctx.accounts.recipient.key() == recipient,
            AjorithmError::WrongRecipient
        );

        let payout_amount = pact.contribution_amount * pact.current_members as u64;
        let escrow_balance = ctx.accounts.escrow.lamports();
        require!(escrow_balance >= payout_amount, AjorithmError::InsufficientFunds);

        // Transfer SOL from escrow to recipient
        **ctx.accounts.escrow.try_borrow_mut_lamports()? -= payout_amount;
        **ctx.accounts.recipient.try_borrow_mut_lamports()? += payout_amount;

        pact.current_round += 1;

        if pact.current_round >= pact.total_rounds {
            pact.is_active = false;
            msg!("Pact completed! All rounds finished.");
        }

        msg!(
            "Payout released to: {} amount: {}",
            recipient,
            payout_amount
        );
        Ok(())
    }

    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
        missed: bool,
    ) -> Result<()> {
        let reputation = &mut ctx.accounts.member_reputation;

        if missed {
            reputation.contributions_missed += 1;
            reputation.streak = 0;
        } else {
            reputation.contributions_made += 1;
            reputation.streak += 1;
        }

        msg!(
            "Reputation updated for: {} streak: {}",
            ctx.accounts.member.key(),
            reputation.streak
        );
        Ok(())
    }
}

// ============================================================
// ACCOUNT STRUCTS
// ============================================================

#[derive(Accounts)]
#[instruction(name: String, contribution_amount: u64, max_members: u8)]
pub struct CreatePact<'info> {
    #[account(
        init,
        payer = organizer,
        space = PactState::space(&name),
        seeds = [b"pact", organizer.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub pact: Account<'info, PactState>,

    #[account(
        init,
        payer = organizer,
        space = ReputationState::SPACE,
        seeds = [b"reputation", organizer.key().as_ref(), pact.key().as_ref()],
        bump
    )]
    pub organizer_reputation: Account<'info, ReputationState>,

    /// CHECK: escrow is a system account PDA that holds SOL
    #[account(
        mut,
        seeds = [b"escrow", pact.key().as_ref()],
        bump
    )]
    pub escrow: UncheckedAccount<'info>,

    #[account(mut)]
    pub organizer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinPact<'info> {
    #[account(mut)]
    pub pact: Account<'info, PactState>,

    #[account(
        init,
        payer = member,
        space = ReputationState::SPACE,
        seeds = [b"reputation", member.key().as_ref(), pact.key().as_ref()],
        bump
    )]
    pub member_reputation: Account<'info, ReputationState>,

    #[account(mut)]
    pub member: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub pact: Account<'info, PactState>,

    #[account(
        mut,
        seeds = [b"reputation", member.key().as_ref(), pact.key().as_ref()],
        bump = member_reputation.bump
    )]
    pub member_reputation: Account<'info, ReputationState>,

    /// CHECK: escrow is a system account PDA that holds SOL
    #[account(
        mut,
        seeds = [b"escrow", pact.key().as_ref()],
        bump
    )]
    pub escrow: UncheckedAccount<'info>,

    #[account(mut)]
    pub member: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleasePayout<'info> {
    #[account(mut)]
    pub pact: Account<'info, PactState>,

    /// CHECK: escrow is a system account PDA that holds SOL
    #[account(
        mut,
        seeds = [b"escrow", pact.key().as_ref()],
        bump
    )]
    pub escrow: UncheckedAccount<'info>,

    /// CHECK: recipient is validated against pact.payout_order in instruction
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    #[account(mut)]
    pub organizer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(mut)]
    pub pact: Account<'info, PactState>,

    #[account(
        mut,
        seeds = [b"reputation", member.key().as_ref(), pact.key().as_ref()],
        bump = member_reputation.bump
    )]
    pub member_reputation: Account<'info, ReputationState>,

    /// CHECK: member pubkey is stored in reputation account
    pub member: UncheckedAccount<'info>,

    #[account(mut)]
    pub organizer: Signer<'info>,
}

// ============================================================
// STATE
// ============================================================

#[account]
pub struct PactState {
    pub organizer: Pubkey,
    pub name: String,
    pub contribution_amount: u64,
    pub max_members: u8,
    pub current_members: u8,
    pub current_round: u8,
    pub total_rounds: u8,
    pub is_active: bool,
    pub members: Vec<Pubkey>,
    pub payout_order: Vec<Pubkey>,
    pub bump: u8,
}

impl PactState {
    pub fn space(name: &str) -> usize {
        8 +          // discriminator
        32 +         // organizer
        4 + name.len() + // name string
        8 +          // contribution_amount
        1 +          // max_members
        1 +          // current_members
        1 +          // current_round
        1 +          // total_rounds
        1 +          // is_active
        4 + (32 * 10) + // members vec (max 10)
        4 + (32 * 10) + // payout_order vec (max 10)
        1            // bump
    }
}

#[account]
pub struct ReputationState {
    pub member: Pubkey,
    pub contributions_made: u16,
    pub contributions_missed: u16,
    pub streak: u16,
    pub bump: u8,
}

impl ReputationState {
    pub const SPACE: usize =
        8 +  // discriminator
        32 + // member
        2 +  // contributions_made
        2 +  // contributions_missed
        2 +  // streak
        1;   // bump
}

// ============================================================
// ERRORS
// ============================================================

#[error_code]
pub enum AjorithmError {
    #[msg("Pact name must be 32 characters or less")]
    NameTooLong,
    #[msg("Member count must be between 2 and 10")]
    InvalidMemberCount,
    #[msg("Contribution amount must be greater than zero")]
    InvalidAmount,
    #[msg("Pact is not active")]
    PactNotActive,
    #[msg("Pact is full")]
    PactFull,
    #[msg("Already a member of this pact")]
    AlreadyMember,
    #[msg("Not a member of this pact")]
    NotAMember,
    #[msg("Only the organizer can trigger payouts")]
    NotOrganizer,
    #[msg("All rounds are complete")]
    AllRoundsComplete,
    #[msg("Wrong recipient for this round")]
    WrongRecipient,
    #[msg("Insufficient funds in escrow")]
    InsufficientFunds,
}
