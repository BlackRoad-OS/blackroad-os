using System;
using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.Worldbuilder.Items
{
    /// <summary>
    /// Simple stack-based inventory for the player.
    /// </summary>
    public class Inventory : MonoBehaviour
    {
        [Serializable]
        public class Slot
        {
            public ItemDefinition item;
            public int count;
        }

        [Header("Slots")]
        [SerializeField] private int maxSlots = 16;
        [SerializeField] private List<Slot> slots = new List<Slot>();

        public int MaxSlots => maxSlots;
        public IReadOnlyList<Slot> Slots => slots;

        private void Awake()
        {
            // Ensure we have a fixed size list
            while (slots.Count < maxSlots)
            {
                slots.Add(new Slot());
            }
        }

        /// <summary>
        /// Try to add a quantity of an item. Returns how many were actually added.
        /// </summary>
        public int AddItem(ItemDefinition item, int amount)
        {
            if (item == null || amount <= 0) return 0;

            int remaining = amount;

            // 1) Fill existing stacks
            for (int i = 0; i < slots.Count && remaining > 0; i++)
            {
                var slot = slots[i];
                if (slot.item == item && slot.count < item.MaxStack)
                {
                    int space = item.MaxStack - slot.count;
                    int add = Mathf.Min(space, remaining);
                    slot.count += add;
                    remaining -= add;
                }
            }

            // 2) Use empty slots
            for (int i = 0; i < slots.Count && remaining > 0; i++)
            {
                var slot = slots[i];
                if (slot.item == null || slot.count <= 0)
                {
                    int add = Mathf.Min(item.MaxStack, remaining);
                    slot.item = item;
                    slot.count = add;
                    remaining -= add;
                }
            }

            int added = amount - remaining;
            return added;
        }

        /// <summary>
        /// Removes up to `amount` items; returns actual removed count.
        /// </summary>
        public int RemoveItem(ItemDefinition item, int amount)
        {
            if (item == null || amount <= 0) return 0;

            int remaining = amount;

            for (int i = 0; i < slots.Count && remaining > 0; i++)
            {
                var slot = slots[i];
                if (slot.item == item && slot.count > 0)
                {
                    int remove = Mathf.Min(slot.count, remaining);
                    slot.count -= remove;
                    remaining -= remove;

                    if (slot.count <= 0)
                    {
                        slot.item = null;
                        slot.count = 0;
                    }
                }
            }

            return amount - remaining;
        }

        public int GetCount(ItemDefinition item)
        {
            if (item == null) return 0;
            int total = 0;

            foreach (var slot in slots)
            {
                if (slot.item == item)
                    total += slot.count;
            }

            return total;
        }

        /// <summary>
        /// Finds any food item with non-zero count, returns it or null.
        /// </summary>
        public ItemDefinition GetAnyFoodItem()
        {
            foreach (var slot in slots)
            {
                if (slot.item != null && slot.item.IsFood && slot.count > 0)
                    return slot.item;
            }

            return null;
        }
    }
}
