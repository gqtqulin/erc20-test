import { GuideDAOToken } from "../typechain-types";
import { loadFixture, ethers, expect } from "./setup";
import { withDecimals } from "./helpers";

describe("TokenExchange", function() {
    async function deploy() {
        const [owner, buyer] = await ethers.getSigners();

        const GuideDAOToken = await ethers.getContractFactory("GuideDAOToken");
        const gui = await GuideDAOToken.deploy(owner.address);
        await gui.waitForDeployment();

        const TokenExchange = await ethers.getContractFactory("TokenExchange");
        const exch = await TokenExchange.deploy(gui.target);
        await exch.waitForDeployment();

        return { gui, exch, owner, buyer }
    }

    it("should allow to buy", async function() {
        const { gui, exch, owner, buyer } = await loadFixture(deploy);

        const tokensInStock = 3n;
        const tokensWithDecimals = await withDecimals(gui, tokensInStock);

        const transferTx = await gui.transfer(exch.target, tokensWithDecimals);
        await transferTx.wait();

        await expect(transferTx).to.changeTokenBalances(
            gui, [owner, exch], [-tokensWithDecimals, tokensWithDecimals]
        );

        const tokensToBuy = 1n;
        const value = ethers.parseEther(tokensToBuy.toString());

        const buyTx = await exch.connect(buyer).buy({ value: value });
        await buyTx.wait();

        await expect(buyTx).to.changeEtherBalances([buyer, exch], [-value, value]);

        await expect(buyTx).to.changeTokenBalances(gui, [exch, buyer], [-value, value]);
    });

    it("should allow to sell", async function() {
        const { gui, exch, buyer } = await loadFixture(deploy);
        
        const ownedTokens = 2n;

        const transferTx = await gui.transfer(buyer.address, await withDecimals(gui, ownedTokens));
        await transferTx.wait();

        const topUpTx = await exch.topUp({value: ethers.parseEther("5")});
        await topUpTx.wait();

        const tokensToSell = 1n;
        const value = ethers.parseEther(tokensToSell.toString());

        const approveTx = await gui.connect(buyer).approve(exch.target, value);
        await approveTx.wait();

        const sellTx = await exch.connect(buyer).sell(value);
        await sellTx.wait();

        await expect(sellTx).to.changeEtherBalances([buyer, exch], [value, -value]);

        await expect(sellTx).to.changeTokenBalances(
            gui, [exch, buyer], [value, -value]
        );
    });

});
