using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace BlackRoad.Worldbuilder.Inventory
{
    /// <summary>
    /// Core inventory management system with slot-based storage.
    /// Manages adding, removing, and organizing items with stack support.
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        [Header("Inventory Settings")]
        [SerializeField] private int inventorySize = 36;
        [SerializeField] private int hotbarSize = 9;
        [SerializeField] private int defaultStackSize = 64;

        [Header("Events")]
        public UnityEvent<int> OnInventoryChanged = new UnityEvent<int>();

        private List<InventorySlot> _slots;

        /// <summary>
        /// Total number of inventory slots.
        /// </summary>
        public int InventorySize => inventorySize;

        /// <summary>
        /// Number of hotbar slots.
        /// </summary>
        public int HotbarSize => hotbarSize;

        /// <summary>
        /// Gets a read-only list of all inventory slots.
        /// </summary>
        public IReadOnlyList<InventorySlot> Slots => _slots;

        private void Awake()
        {
            InitializeSlots();
        }

        /// <summary>
        /// Initializes all inventory slots.
        /// </summary>
        private void InitializeSlots()
        {
            _slots = new List<InventorySlot>();
            for (int i = 0; i < inventorySize; i++)
            {
                _slots.Add(new InventorySlot(defaultStackSize));
            }
        }

        /// <summary>
        /// Adds items to the inventory with stacking logic.
        /// </summary>
        /// <param name="blockTypeID">Block type ID to add</param>
        /// <param name="quantity">Amount to add</param>
        /// <returns>Amount actually added</returns>
        public int AddItem(string blockTypeID, int quantity)
        {
            if (string.IsNullOrEmpty(blockTypeID) || quantity <= 0)
                return 0;

            int remaining = quantity;
            List<int> modifiedSlots = new List<int>();

            // First pass: fill existing stacks of the same type
            for (int i = 0; i < _slots.Count && remaining > 0; i++)
            {
                var slot = _slots[i];
                if (!slot.IsEmpty() && slot.blockTypeID == blockTypeID && !slot.IsFull())
                {
                    int overflow = slot.AddItem(blockTypeID, remaining);
                    remaining = overflow;
                    modifiedSlots.Add(i);
                }
            }

            // Second pass: fill empty slots
            for (int i = 0; i < _slots.Count && remaining > 0; i++)
            {
                var slot = _slots[i];
                if (slot.IsEmpty())
                {
                    int overflow = slot.AddItem(blockTypeID, remaining);
                    remaining = overflow;
                    modifiedSlots.Add(i);
                }
            }

            // Notify about changes
            foreach (int index in modifiedSlots)
            {
                OnInventoryChanged?.Invoke(index);
            }

            return quantity - remaining;
        }

        /// <summary>
        /// Removes items from the inventory.
        /// </summary>
        /// <param name="blockTypeID">Block type ID to remove</param>
        /// <param name="quantity">Amount to remove</param>
        /// <returns>Amount actually removed</returns>
        public int RemoveItem(string blockTypeID, int quantity)
        {
            if (string.IsNullOrEmpty(blockTypeID) || quantity <= 0)
                return 0;

            int remaining = quantity;
            List<int> modifiedSlots = new List<int>();

            // Remove from slots
            for (int i = 0; i < _slots.Count && remaining > 0; i++)
            {
                var slot = _slots[i];
                if (!slot.IsEmpty() && slot.blockTypeID == blockTypeID)
                {
                    int removed = slot.RemoveItem(remaining);
                    remaining -= removed;
                    modifiedSlots.Add(i);
                }
            }

            // Notify about changes
            foreach (int index in modifiedSlots)
            {
                OnInventoryChanged?.Invoke(index);
            }

            return quantity - remaining;
        }

        /// <summary>
        /// Checks if the inventory has a specific quantity of an item.
        /// </summary>
        /// <param name="blockTypeID">Block type ID to check</param>
        /// <param name="quantity">Required quantity</param>
        /// <returns>True if inventory has at least the required quantity</returns>
        public bool HasItem(string blockTypeID, int quantity)
        {
            if (string.IsNullOrEmpty(blockTypeID) || quantity <= 0)
                return false;

            int count = 0;
            foreach (var slot in _slots)
            {
                if (!slot.IsEmpty() && slot.blockTypeID == blockTypeID)
                {
                    count += slot.quantity;
                    if (count >= quantity)
                        return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Gets a specific inventory slot.
        /// </summary>
        /// <param name="index">Slot index</param>
        /// <returns>The slot at the specified index, or null if invalid</returns>
        public InventorySlot GetSlot(int index)
        {
            if (index < 0 || index >= _slots.Count)
                return null;
            
            return _slots[index];
        }

        /// <summary>
        /// Gets a specific hotbar slot.
        /// </summary>
        /// <param name="index">Hotbar index (0-8)</param>
        /// <returns>The hotbar slot at the specified index, or null if invalid</returns>
        public InventorySlot GetHotbarSlot(int index)
        {
            if (index < 0 || index >= hotbarSize)
                return null;
            
            return _slots[index];
        }

        /// <summary>
        /// Swaps items between two slots.
        /// </summary>
        /// <param name="indexA">First slot index</param>
        /// <param name="indexB">Second slot index</param>
        public void SwapSlots(int indexA, int indexB)
        {
            if (indexA < 0 || indexA >= _slots.Count || indexB < 0 || indexB >= _slots.Count)
                return;

            var slotA = _slots[indexA];
            var slotB = _slots[indexB];

            // Swap contents
            string tempID = slotA.blockTypeID;
            int tempQty = slotA.quantity;

            slotA.blockTypeID = slotB.blockTypeID;
            slotA.quantity = slotB.quantity;

            slotB.blockTypeID = tempID;
            slotB.quantity = tempQty;

            // Notify about changes
            OnInventoryChanged?.Invoke(indexA);
            OnInventoryChanged?.Invoke(indexB);
        }

        /// <summary>
        /// Clears all inventory slots.
        /// </summary>
        public void ClearInventory()
        {
            for (int i = 0; i < _slots.Count; i++)
            {
                _slots[i].Clear();
                OnInventoryChanged?.Invoke(i);
            }
        }

        /// <summary>
        /// Gets the total count of a specific item across all slots.
        /// </summary>
        /// <param name="blockTypeID">Block type ID to count</param>
        /// <returns>Total count</returns>
        public int GetItemCount(string blockTypeID)
        {
            if (string.IsNullOrEmpty(blockTypeID))
                return 0;

            int count = 0;
            foreach (var slot in _slots)
            {
                if (!slot.IsEmpty() && slot.blockTypeID == blockTypeID)
                {
                    count += slot.quantity;
                }
            }

            return count;
        }
    }
}
