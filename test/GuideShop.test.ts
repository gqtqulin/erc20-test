
import { GuideDAOToken } from "../typechain-types";
import { loadFixture, ethers, expect } from "./setup";
import { withDecimals } from "./helpers";

describe("GuideShop", function() {
    async function deploy() {
        const [owner, buyer] = await ethers.getSigners();

        const GuideDAOToken = await ethers.getContractFactory("GuideDAOToken");
        const gui = await GuideDAOToken.deploy(owner.address);
        await gui.waitForDeployment();

        const GuideShop = await ethers.getContractFactory("GuideShop");
        const shop = await GuideShop.deploy(gui.target);
        await shop.waitForDeployment();

        return { gui, shop, owner, buyer }
    }

    it("should allow to buy", async function() {
        const { gui, shop, buyer } = await loadFixture(deploy);

        const transferTx = await gui.transfer(buyer.address, await withDecimals(gui, 3n));
        await transferTx.wait();

        const price = 1000n;

        const addTx = await shop.addItem(price, 5, "test item");
        addTx.wait();

        const uid = await shop.uniqueIds(0);
        const deliveryAddress = "demo addr";
        const quantity = 2n;
        const totalPrice = quantity * price;

        const approveTx = await gui.connect(buyer).approve(shop.target, totalPrice);
        await approveTx.wait();

        const buyTx = await shop.connect(buyer).buy(uid, quantity, deliveryAddress);

        await expect(buyTx).to.changeTokenBalances(
            gui, [shop, buyer], [totalPrice, -totalPrice]
        );

        expect(await gui.allowance(buyer.address, shop.target)).to.eq(0);

        const boughtItem = await shop.buyers(buyer.address, 0);

        expect(boughtItem.deliveryAddress).to.eq(deliveryAddress);
        expect(boughtItem.uniqueId).to.eq(uid);
        expect(boughtItem.numOfPurchasedItems).to.eq(quantity);
    })
});