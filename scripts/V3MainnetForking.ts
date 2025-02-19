import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

// Convert addresses to checksum format
const UniswapV3Address = ethers.getAddress("0xC36442b4a4522E871399CD717aBDD847Ab11FE88");
const usdcAddress = ethers.getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48");
const wethAddress = ethers.getAddress("0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const usdcWhale = ethers.getAddress("0x55fe002aeff02f77364de339a1292923a15844b8");

async function main() {
    console.log("USDC Address:", usdcAddress);
    console.log("WETH Address:", wethAddress);
    console.log("Uniswap V3 Position Manager Address:", UniswapV3Address);
    console.log("USDC Whale Address:", usdcWhale);

    // Impersonate USDC Whale
    await helpers.impersonateAccount(usdcWhale);
    const impersonatedSigner = await ethers.getSigner(usdcWhale);

    // Get contract instances
    const usdc = await ethers.getContractAt("IERC20", usdcAddress);
    const weth = await ethers.getContractAt("IERC20", wethAddress);
    const uniswapV3 = await ethers.getContractAt("IUniswapV3PositionManager", UniswapV3Address);

    // Approve Uniswap to spend USDC and WETH
    await usdc.connect(impersonatedSigner).approve(UniswapV3Address, ethers.MaxUint256);
    await weth.connect(impersonatedSigner).approve(UniswapV3Address, ethers.MaxUint256);

    console.log("Tokens approved!");

    // Define liquidity parameters
    const params = {
        token0: usdcAddress,
        token1: wethAddress,
        fee: 3000,
        tickLower: -887220,
        tickUpper: 887220,
        amount0Desired: ethers.parseUnits("500", 6), // 500 USDC
        amount1Desired: ethers.parseUnits("0.5", 18), // 0.5 WETH
        amount0Min: 0,
        amount1Min: 0,
        recipient: impersonatedSigner.address,
        deadline: Math.floor(Date.now() / 1000) + 600,
    };

    console.log("Minting liquidity...", params);

    // Add liquidity
    try {
        const tx = await uniswapV3.mint(params);
        await tx.wait();
        console.log("Liquidity added successfully!", tx.hash);
    } catch (error) {
        console.error("Minting liquidity failed:", error);
    }
}

main().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
