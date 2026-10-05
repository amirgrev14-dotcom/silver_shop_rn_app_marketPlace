import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: "../.env" });
process.env.DATABASE_URL = "postgresql://silver_shop_user:SILVER@localhost:5433/silver_shop_auth?schema=public";
const { prisma } = await import("./src/lib/prisma.js");

const USER_ID = "c14381b9-60b2-42ae-b520-ac3bb27b4833";

await prisma.$executeRawUnsafe(
  `UPDATE "User" SET status='ACTIVE', "emailVerifiedAt"=NOW(), "updatedAt"=NOW() WHERE id='${USER_ID}'`
);

const items: Array<[string, number, string[], string, number]> = [
  ["Silver Ring with Turquoise", 49.99, ["Jewelry", "Rings"], "Handcrafted sterling silver ring set with a natural turquoise stone.", 5],
  ["Pearl Necklace Classic", 89.5, ["Jewelry", "Necklaces"], "Freshwater pearl necklace with sterling silver clasp.", 3],
  ["Silver Hoop Earrings", 29.99, ["Jewelry", "Earrings"], "Lightweight everyday silver hoops, polished finish.", 10],
  ["Vintage Silver Bracelet", 64.0, ["Jewelry", "Bracelets", "Vintage"], "Antique-look link bracelet, adjustable size.", 2],
  ["Silver Anklet Chain", 24.5, ["Jewelry", "Anklets"], "Delicate chain anklet with small charm.", 7],
  ["Gold-Plated Silver Watch", 199.0, ["Watches"], "Minimalist watch with gold-tone case and leather strap.", 4],
  ["Silver Chronograph Watch", 259.99, ["Watches"], "Steel-silver chronograph with date window.", 2],
  ["Roman Coin Replica", 15.0, ["Coins"], "Detailed replica coin, collectors edition.", 20],
  ["Silver Coin Collection Set", 120.0, ["Coins"], "Set of 5 silver commemorative coins in case.", 5],
  ["Ancient Greek Style Coin", 19.99, ["Coins", "Vintage"], "Inspired by ancient Greek currency.", 15],
  ["Silver Tea Set", 349.0, ["Tableware"], "Elegant 6-piece sterling silver tea set.", 1],
  ["Silver Coffee Spoon Set", 45.0, ["Tableware"], "Set of 6 polished coffee spoons.", 8],
  ["Silver Serving Tray", 159.99, ["Tableware", "Decor"], "Engraved serving tray with handles.", 2],
  ["Silver Candle Holder Pair", 54.0, ["Decor"], "Pair of candlesticks with floral engraving.", 6],
  ["Silver Photo Frame", 69.99, ["Decor"], "Classic silver frame 10x15 cm.", 4],
  ["Silver Wall Mirror", 189.0, ["Decor", "Vintage"], "Ornate vintage-style wall mirror.", 1],
  ["Antique Silver Locket", 79.0, ["Jewelry", "Necklaces", "Vintage"], "Victorian-style locket with chain.", 3],
  ["Silver Brooch Flower", 34.5, ["Jewelry", "Vintage"], "Floral brooch with enamel details.", 5],
  ["Men's Silver Ring", 39.99, ["Jewelry", "Rings"], "Wide band ring, brushed silver finish.", 9],
  ["Stackable Silver Rings Set", 44.0, ["Jewelry", "Rings"], "Set of 4 thin rings for stacking.", 6],
  ["Silver Charm Bracelet", 59.99, ["Jewelry", "Bracelets"], "Charm bracelet with 5 charms included.", 4],
  ["Gemstone Earrings Amethyst", 42.0, ["Jewelry", "Earrings"], "925 silver earrings with amethyst stones.", 7],
  ["Pearl Stud Earrings", 27.5, ["Jewelry", "Earrings"], "Classic pearl studs on silver posts.", 12],
  ["Silver Choker Necklace", 38.0, ["Jewelry", "Necklaces"], "Adjustable choker with small pendant.", 5],
  ["Layered Silver Necklaces", 52.0, ["Jewelry", "Necklaces"], "Two-layer necklace set.", 6],
  ["Silver Tooth Pendant", 18.99, ["Jewelry", "Necklaces", "Other Items"], "Protective tooth pendant, trendy style.", 15],
  ["Silver Chain Necklace Snake", 31.0, ["Jewelry", "Necklaces"], "Smooth snake chain, 45 cm.", 8],
  ["Vintage Silver Pocket Watch", 95.0, ["Watches", "Vintage"], "Mechanical pocket watch with engraving.", 2],
  ["Silver Pendant Owl", 22.5, ["Jewelry", "Necklaces"], "Owl pendant with onyx eyes.", 10],
  ["Silver Cuff Bracelet", 47.0, ["Jewelry", "Bracelets"], "Open cuff with engraved pattern.", 5],
  ["Silver Bar Necklace", 26.99, ["Jewelry", "Necklaces"], "Minimalist bar pendant necklace.", 11],
  ["Silver Napkin Ring Set", 33.0, ["Tableware"], "Set of 4 polished napkin rings.", 9],
  ["Silver Salt and Pepper Shakers", 58.0, ["Tableware"], "Engraved shaker set.", 3],
  ["Silver Bookmark Ornate", 12.99, ["Decor", "Vintage", "Others"], "Filigree bookmark with tassel.", 25],
  ["Silver Keychain Engraved", 9.99, ["Other Items", "Others"], "Personalized keychain blank.", 30],
  ["Silver Hip Flask", 49.0, ["Other Items"], "Engraved flask 200 ml.", 4],
  ["Silver Medal Pendant", 16.5, ["Coins", "Jewelry", "Necklaces"], "Commemorative medal on chain.", 14],
  ["Silver Baby Spoon", 21.0, ["Tableware"], "First-spoon gift set.", 6],
  ["Antique Silver Box", 85.0, ["Vintage", "Decor"], "Ornamented keepsake box.", 2],
  ["Silver Tie Clip", 19.99, ["Other Items"], "Engraved tie clip, gift box.", 10],
  ["Silver Bracelet with Charms", 55.0, ["Jewelry", "Bracelets", "Vintage"], "Vintage-style charm bracelet.", 3],
];

for (let i = 0; i < items.length; i++) {
  const [title, price, categories, description, stock] = items[i];
  await prisma.product.create({
    data: {
      title, price, categories, description, stock,
      status: "ACTIVE",
      images: [`https://picsum.photos/seed/silver${i + 1}/800/800`],
      sellerId: USER_ID,
      sellerName: "Beta Seller",
    },
  });
}

const count = await prisma.product.count({ where: { sellerId: USER_ID } });
console.log("Products for beta seller:", count);
const user = await prisma.$queryRawUnsafe(`SELECT id,email,status,"emailVerifiedAt" FROM "User" WHERE id='${USER_ID}'`);
console.log(user);
await prisma.$disconnect();
