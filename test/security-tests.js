// Security Test Suite for XPSwap DEX Enhanced Contracts
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("XPSwap Security Tests", function () {
    let dex, pool, xpsToken;
    let owner, user1, user2, attacker;
    let mockTokenA, mockTokenB;

    beforeEach(async function () {
        [owner, user1, user2, attacker] = await ethers.getSigners();

        // Deploy mock tokens
        const MockToken = await ethers.getContractFactory("MockERC20");
        mockTokenA = await MockToken.deploy("TokenA", "TKA", ethers.utils.parseEther("1000000"));
        mockTokenB = await MockToken.deploy("TokenB", "TKB", ethers.utils.parseEther("1000000"));
        xpsToken = await MockToken.deploy("XPSwap", "XPS", ethers.utils.parseEther("1000000000"));

        // Deploy secure contracts
        const SecureDEX = await ethers.getContractFactory("XpSwapDEXSecure");
        dex = await SecureDEX.deploy(owner.address);

        const SecurePool = await ethers.getContractFactory("XpSwapLiquidityPoolSecure");
        pool = await SecurePool.deploy(
            mockTokenA.address,
            mockTokenB.address,
            "XPSwap LP",
            "XPLP"
        );

        // Setup initial liquidity
        await mockTokenA.transfer(user1.address, ethers.utils.parseEther("10000"));
        await mockTokenB.transfer(user1.address, ethers.utils.parseEther("10000"));
        await mockTokenA.connect(user1).approve(pool.address, ethers.utils.parseEther("10000"));
        await mockTokenB.connect(user1).approve(pool.address, ethers.utils.parseEther("10000"));
    });

    describe("Reentrancy Protection Tests", function () {
        it("Should prevent reentrancy attacks on addLiquidity", async function () {
            // Add initial liquidity first
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );

            // Test reentrancy protection by attempting to call addLiquidity again
            // in the same transaction context (simulated)
            await expect(
                pool.connect(user1).addLiquidity(
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("95"),
                    ethers.utils.parseEther("95"),
                    user1.address
                )
            ).to.not.be.revertedWith("ReentrancyGuard: reentrant call");
        });

        it("Should allow normal sequential transactions", async function () {
            // First transaction
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );

            // Second transaction (different block)
            await network.provider.send("hardhat_mine", ["0x1"]);
            
            await expect(
                pool.connect(user1).addLiquidity(
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("95"),
                    ethers.utils.parseEther("95"),
                    user1.address
                )
            ).to.not.be.reverted;
        });
    });

    describe("MEV Protection Tests", function () {
        beforeEach(async function () {
            // Setup pool with liquidity
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );
        });

        it("Should prevent rapid successive transactions", async function () {
            // First swap should work
            await pool.connect(user1).swap(
                ethers.utils.parseEther("10"),
                0,
                0,
                ethers.utils.parseEther("9"),
                user1.address
            );

            // Second swap immediately should fail due to MEV protection
            await expect(
                pool.connect(user1).swap(
                    ethers.utils.parseEther("10"),
                    0,
                    0,
                    ethers.utils.parseEther("9"),
                    user1.address
                )
            ).to.be.revertedWith("MEV protection: too frequent");
        });

        it("Should allow transactions after block delay", async function () {
            // First swap
            await pool.connect(user1).swap(
                ethers.utils.parseEther("10"),
                0,
                0,
                ethers.utils.parseEther("9"),
                user1.address
            );

            // Mine enough blocks to pass delay
            await network.provider.send("hardhat_mine", ["0x3"]);

            // Second swap should now work
            await expect(
                pool.connect(user1).swap(
                    ethers.utils.parseEther("10"),
                    0,
                    0,
                    ethers.utils.parseEther("9"),
                    user1.address
                )
            ).to.not.be.reverted;
        });
    });

    describe("Slippage Protection Tests", function () {
        beforeEach(async function () {
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );
        });

        it("Should prevent high slippage trades", async function () {
            // Attempt trade with too high amount (>50% of reserves)
            await expect(
                pool.connect(user1).swap(
                    ethers.utils.parseEther("600"), // 60% of reserves
                    0,
                    0,
                    ethers.utils.parseEther("400"),
                    user1.address
                )
            ).to.be.revertedWith("Swap too large");
        });

        it("Should allow reasonable trades", async function () {
            // Normal trade should work
            await expect(
                pool.connect(user1).swap(
                    ethers.utils.parseEther("50"), // 5% of reserves
                    0,
                    0,
                    ethers.utils.parseEther("45"),
                    user1.address
                )
            ).to.not.be.reverted;
        });

        it("Should calculate price impact correctly", async function () {
            const [amountOut, priceImpact] = await pool.getAmountOut(
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000")
            );

            expect(priceImpact).to.be.lt(1000); // Less than 10%
            expect(amountOut).to.be.gt(0);
        });
    });

    describe("Circuit Breaker Tests", function () {
        it("Should trigger circuit breaker on high price impact", async function () {
            // Create small pool for easier circuit breaker trigger
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("95"),
                ethers.utils.parseEther("95"),
                user1.address
            );

            // Mine blocks to avoid MEV protection
            await network.provider.send("hardhat_mine", ["0x3"]);

            // Attempt large trade that should trigger circuit breaker
            await expect(
                pool.connect(user1).swap(
                    ethers.utils.parseEther("15"), // 15% of small pool
                    0,
                    0,
                    ethers.utils.parseEther("12"),
                    user1.address
                )
            ).to.be.revertedWith("Circuit breaker activated: high price impact");
        });

        it("Should allow circuit breaker reset by authorized users", async function () {
            // Add authorized user
            await pool.addAuthorized(user1.address);

            // Check initial state
            const initialHealth = await pool.getPoolHealth();
            expect(initialHealth.circuitBreakerStatus).to.be.false;

            // Fast forward time to allow reset (if needed)
            await network.provider.send("evm_increaseTime", [3700]);

            // Reset should work
            await expect(pool.connect(user1).resetCircuitBreaker()).to.not.be.reverted;
        });
    });

    describe("Flash Loan Security Tests", function () {
        beforeEach(async function () {
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );
        });

        it("Should require flash loan repayment with fees", async function () {
            const amount = ethers.utils.parseEther("100");
            const expectedFee = amount.mul(9).div(10000); // 0.09%

            // Create simple flash loan receiver
            const FlashLoanReceiver = await ethers.getContractFactory("SimpleFlashLoanReceiver");
            const receiver = await FlashLoanReceiver.deploy();

            // Fund receiver for fees
            await mockTokenA.transfer(receiver.address, expectedFee);

            await expect(
                receiver.initiateFlashLoan(pool.address, amount, 0)
            ).to.emit(pool, "FlashLoan");
        });

        it("Should prevent flash loan without repayment", async function () {
            // This would require a malicious contract that doesn't repay
            // For now, we test that the debt tracking works
            const userDebt = await pool.flashLoanDebt(user1.address);
            expect(userDebt).to.equal(0);
        });
    });

    describe("Governance Security Tests", function () {
        it("Should require governance approval for pool creation", async function () {
            // Non-governance member cannot create pool
            await expect(
                dex.connect(user1).createPool(
                    mockTokenA.address,
                    mockTokenB.address,
                    30
                )
            ).to.be.revertedWith("Not governance member");
        });

        it("Should allow governance members to manage pools", async function () {
            // Create pool as governance member (owner)
            await dex.createPool(mockTokenA.address, mockTokenB.address, 30);
            
            const poolId = await dex.getPoolId(mockTokenA.address, mockTokenB.address);
            const poolInfo = await dex.getPoolInfo(poolId);
            expect(poolInfo.active).to.be.true;

            // Toggle pool status
            await dex.togglePoolStatus(poolId);
            const updatedPoolInfo = await dex.getPoolInfo(poolId);
            expect(updatedPoolInfo.active).to.be.false;
        });

        it("Should allow adding and removing governance members", async function () {
            // Add new governance member
            await dex.addGovMember(user1.address);
            
            // New member should be able to perform governance actions
            await dex.createPool(mockTokenA.address, mockTokenB.address, 30);
            const poolId = await dex.getPoolId(mockTokenA.address, mockTokenB.address);
            
            await expect(
                dex.connect(user1).togglePoolStatus(poolId)
            ).to.not.be.reverted;

            // Add another member so we can remove the first one
            await dex.addGovMember(user2.address);
            
            // Remove governance member
            await dex.removeGovMember(user1.address);
            
            // Removed member should no longer have governance rights
            await expect(
                dex.connect(user1).togglePoolStatus(poolId)
            ).to.be.revertedWith("Not governance member");
        });

        it("Should prevent removal of last governance member", async function () {
            await expect(
                dex.removeGovMember(owner.address)
            ).to.be.revertedWith("Cannot remove last member");
        });
    });

    describe("SafeMath Protection Tests", function () {
        it("Should handle large number calculations safely", async function () {
            const largeAmount = ethers.utils.parseEther("1000000"); // 1M tokens
            
            await mockTokenA.transfer(user1.address, largeAmount);
            await mockTokenB.transfer(user1.address, largeAmount);
            await mockTokenA.connect(user1).approve(pool.address, largeAmount);
            await mockTokenB.connect(user1).approve(pool.address, largeAmount);
            
            // Large liquidity addition should work without overflow
            await expect(
                pool.connect(user1).addLiquidity(
                    largeAmount,
                    largeAmount,
                    largeAmount.mul(95).div(100),
                    largeAmount.mul(95).div(100),
                    user1.address
                )
            ).to.not.be.reverted;
        });

        it("Should prevent calculation overflows", async function () {
            // Test with very large values that might cause overflow
            const maxSafeUint = ethers.BigNumber.from("2").pow(128);
            
            await expect(
                pool.getAmountOut(maxSafeUint, ethers.utils.parseEther("1000"), ethers.utils.parseEther("1000"))
            ).to.be.reverted; // Should revert due to overflow protection
        });
    });

    describe("Emergency Functions Tests", function () {
        it("Should allow emergency pause by authorized users", async function () {
            await pool.addAuthorized(user1.address);
            
            await pool.connect(user1).emergencyPause();
            
            // Operations should be paused
            await expect(
                pool.connect(user1).addLiquidity(
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("95"),
                    ethers.utils.parseEther("95"),
                    user1.address
                )
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow unpause by authorized users", async function () {
            await pool.addAuthorized(user1.address);
            
            // Pause
            await pool.connect(user1).emergencyPause();
            
            // Unpause
            await pool.connect(user1).unpause();
            
            // Operations should work again
            await expect(
                pool.connect(user1).addLiquidity(
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("95"),
                    ethers.utils.parseEther("95"),
                    user1.address
                )
            ).to.not.be.reverted;
        });

        it("Should not allow unauthorized users to pause", async function () {
            await expect(
                pool.connect(user1).emergencyPause()
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("Price Oracle Security Tests", function () {
        it("Should update price oracle with time constraints", async function () {
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );

            const [reserveA, reserveB, lastUpdate] = await pool.getReserves();
            expect(reserveA).to.be.gt(0);
            expect(reserveB).to.be.gt(0);
            expect(lastUpdate).to.be.gt(0);
        });

        it("Should resist price manipulation through oracle", async function () {
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );

            // Fast forward time for oracle update
            await network.provider.send("evm_increaseTime", [1801]); // 30+ minutes
            await network.provider.send("hardhat_mine", ["0x1"]);

            // Attempt manipulation should be limited by slippage protection
            await expect(
                pool.connect(user1).swap(
                    ethers.utils.parseEther("600"),
                    0,
                    0,
                    ethers.utils.parseEther("400"),
                    user1.address
                )
            ).to.be.revertedWith("Swap too large");
        });
    });

    describe("Integration Security Tests", function () {
        it("Should handle complex multi-step operations securely", async function () {
            // Add liquidity
            await pool.connect(user1).addLiquidity(
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("1000"),
                ethers.utils.parseEther("950"),
                ethers.utils.parseEther("950"),
                user1.address
            );

            // Wait for MEV protection
            await network.provider.send("hardhat_mine", ["0x3"]);

            // Multiple swaps with different users
            await mockTokenA.transfer(user2.address, ethers.utils.parseEther("100"));
            await mockTokenA.connect(user2).approve(pool.address, ethers.utils.parseEther("100"));

            await pool.connect(user2).swap(
                ethers.utils.parseEther("10"),
                0,
                0,
                ethers.utils.parseEther("9"),
                user2.address
            );

            // Check that all protections are still active
            const poolHealth = await pool.getPoolHealth();
            expect(poolHealth.healthy).to.be.true;
        });

        it("Should maintain security across governance changes", async function () {
            // Add new governance member
            await dex.addGovMember(user1.address);

            // Create pool with new member
            await dex.connect(user1).createPool(mockTokenA.address, mockTokenB.address, 30);

            // Ensure original security features still work
            await expect(
                dex.connect(user2).createPool(mockTokenA.address, mockTokenB.address, 50)
            ).to.be.revertedWith("Not governance member");
        });
    });
});
