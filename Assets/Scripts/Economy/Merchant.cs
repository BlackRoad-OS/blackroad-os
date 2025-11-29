using UnityEngine;
using BlackRoad.Worldbuilder.Interaction;
using BlackRoad.Worldbuilder.Items;

namespace BlackRoad.Worldbuilder.Economy
{
    /// <summary>
    /// Simple merchant that can buy and sell specific items from/to the player.
    /// Currently uses a fixed price list and does a single transaction per interaction.
    /// (You can expand this into a full UI later.)
    /// </summary>
    public class Merchant : Interactable
    {
        [System.Serializable]
        public class TradeItem
        {
            public ItemDefinition item;
            [Tooltip("Price in coins per unit when player BUYS.")]
            public int buyPrice = 5;
            [Tooltip("Price in coins per unit when player SELLS.")]
            public int sellPrice = 3;
        }

        [Header("Inventory / Wallet")]
        [SerializeField] private Inventory merchantInventory;
        [SerializeField] private PlayerWallet merchantWallet;
        [SerializeField] private TradeItem[] tradeItems;

        [Header("Mode")]
        [Tooltip("If true, this interaction attempts to SELL one unit of selected item to player.\nIf false, attempts to BUY one unit from player.")]
        [SerializeField] private bool defaultSellToPlayer = true;

        private void Awake()
        {
#if UNITY_EDITOR
            // Set display info for Interactable UI
            var so = new UnityEditor.SerializedObject(this);
            so.FindProperty("displayName").stringValue = "Merchant";
            so.FindProperty("verb").stringValue = "Trade";
            so.ApplyModifiedPropertiesWithoutUndo();
#endif
        }

        public override void Interact(GameObject interactor)
        {
            var playerInventory = interactor.GetComponent<Inventory>();
            var playerWallet = interactor.GetComponent<PlayerWallet>();

            if (playerInventory == null || playerWallet == null)
            {
                Debug.LogWarning("[Merchant] Player missing Inventory or PlayerWallet.");
                return;
            }

            // For now we just trade the first configured item.
            if (tradeItems == null || tradeItems.Length == 0)
            {
                Debug.LogWarning("[Merchant] No trade items configured.");
                return;
            }

            var tradeItem = tradeItems[0];
            if (tradeItem.item == null)
            {
                Debug.LogWarning("[Merchant] Trade item has no ItemDefinition assigned.");
                return;
            }

            if (defaultSellToPlayer)
            {
                SellToPlayer(tradeItem, playerInventory, playerWallet);
            }
            else
            {
                BuyFromPlayer(tradeItem, playerInventory, playerWallet);
            }
        }

        private void SellToPlayer(TradeItem trade, Inventory playerInventory, PlayerWallet playerWallet)
        {
            int price = trade.buyPrice;
            if (price <= 0)
            {
                Debug.LogWarning("[Merchant] Invalid buyPrice.");
                return;
            }

            if (!playerWallet.CanAfford(price))
            {
                Debug.Log("[Merchant] Player cannot afford this item.");
                return;
            }

            // Optionally check merchant inventory; for now assume infinite stock
            int added = playerInventory.AddItem(trade.item, 1);
            if (added > 0)
            {
                playerWallet.TrySpend(price);
                if (merchantWallet != null)
                    merchantWallet.AddCoins(price);

                Debug.Log($"[Merchant] Player bought 1x {trade.item.DisplayName} for {price} coins.");
            }
        }

        private void BuyFromPlayer(TradeItem trade, Inventory playerInventory, PlayerWallet playerWallet)
        {
            int price = trade.sellPrice;
            if (price <= 0)
            {
                Debug.LogWarning("[Merchant] Invalid sellPrice.");
                return;
            }

            int count = playerInventory.GetCount(trade.item);
            if (count <= 0)
            {
                Debug.Log("[Merchant] Player has none of that item to sell.");
                return;
            }

            int removed = playerInventory.RemoveItem(trade.item, 1);
            if (removed > 0)
            {
                // Pay player
                playerWallet.AddCoins(price);
                if (merchantWallet != null && merchantWallet.CanAfford(price))
                    merchantWallet.TrySpend(price);

                Debug.Log($"[Merchant] Player sold 1x {trade.item.DisplayName} for {price} coins.");
            }
        }
    }
}
