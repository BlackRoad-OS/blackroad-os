using System.Collections.Generic;
using UnityEngine;
using BlackRoad.Worldbuilder.Items;

namespace BlackRoad.Worldbuilder.Economy
{
    /// <summary>
    /// Periodically produces items into an internal stockpile.
    /// Merchants or players can later claim from this stockpile.
    /// Example: farm producing berries, mine producing ore.
    /// </summary>
    public class ResourceProducer : MonoBehaviour
    {
        [System.Serializable]
        public class Output
        {
            public ItemDefinition item;
            [Tooltip("How many units produced per cycle.")]
            public int amountPerCycle = 1;
        }

        [Header("Production")]
        [SerializeField] private Output[] outputs;
        [SerializeField] private float cycleSeconds = 30f;
        [SerializeField] private int maxStoredPerItem = 50;

        private readonly Dictionary<ItemDefinition, int> _stock = new Dictionary<ItemDefinition, int>();
        private float _timer;

        public int GetStock(ItemDefinition item)
        {
            return item != null && _stock.TryGetValue(item, out var count)
                ? count
                : 0;
        }

        private void Update()
        {
            if (outputs == null || outputs.Length == 0) return;

            _timer += Time.deltaTime;
            if (_timer >= cycleSeconds)
            {
                _timer -= cycleSeconds;
                RunCycle();
            }
        }

        private void RunCycle()
        {
            foreach (var o in outputs)
            {
                if (o.item == null || o.amountPerCycle <= 0) continue;

                if (!_stock.TryGetValue(o.item, out var count))
                    count = 0;

                int newCount = Mathf.Min(count + o.amountPerCycle, maxStoredPerItem);
                _stock[o.item] = newCount;
            }
        }

        /// <summary>
        /// Consume up to amount from stock, returns actual removed.
        /// </summary>
        public int TakeFromStock(ItemDefinition item, int amount)
        {
            if (item == null || amount <= 0) return 0;

            if (!_stock.TryGetValue(item, out var count) || count <= 0)
                return 0;

            int taken = Mathf.Min(count, amount);
            int remaining = count - taken;
            if (remaining <= 0)
                _stock.Remove(item);
            else
                _stock[item] = remaining;

            return taken;
        }

        /// <summary>
        /// Optional: give all current stock to a target inventory.
        /// </summary>
        public void TransferAllToInventory(Inventory inventory)
        {
            if (inventory == null) return;

            var keys = new List<ItemDefinition>(_stock.Keys);
            foreach (var item in keys)
            {
                int count = _stock[item];
                if (count <= 0) continue;

                int added = inventory.AddItem(item, count);
                TakeFromStock(item, added);
            }
        }
    }
}
