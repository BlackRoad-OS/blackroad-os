using System;

namespace BlackRoad.Worldbuilder.Inventory
{
    /// <summary>
    /// Data structure representing a single inventory slot.
    /// Can hold a specific block type with a quantity up to maxStackSize.
    /// </summary>
    [Serializable]
    public class InventorySlot
    {
        /// <summary>
        /// The ID of the block type stored in this slot.
        /// </summary>
        public string blockTypeID;
        
        /// <summary>
        /// Current quantity of items in this slot.
        /// </summary>
        public int quantity;
        
        /// <summary>
        /// Maximum number of items that can be stored in this slot.
        /// </summary>
        public int maxStackSize;

        /// <summary>
        /// Creates a new empty inventory slot.
        /// </summary>
        /// <param name="maxStack">Maximum stack size (default 64)</param>
        public InventorySlot(int maxStack = 64)
        {
            blockTypeID = null;
            quantity = 0;
            maxStackSize = maxStack;
        }

        /// <summary>
        /// Checks if this slot is empty.
        /// </summary>
        /// <returns>True if slot contains no items</returns>
        public bool IsEmpty()
        {
            return string.IsNullOrEmpty(blockTypeID) || quantity <= 0;
        }

        /// <summary>
        /// Checks if this slot is full.
        /// </summary>
        /// <returns>True if quantity equals maxStackSize</returns>
        public bool IsFull()
        {
            return quantity >= maxStackSize;
        }

        /// <summary>
        /// Checks if items can be added to this slot.
        /// </summary>
        /// <param name="itemBlockTypeID">The block type ID to check</param>
        /// <param name="amount">Amount to add</param>
        /// <returns>True if items can be added</returns>
        public bool CanAddItem(string itemBlockTypeID, int amount)
        {
            if (IsEmpty())
                return true;
            
            if (blockTypeID == itemBlockTypeID && !IsFull())
                return true;
            
            return false;
        }

        /// <summary>
        /// Adds items to this slot. Returns the amount that couldn't fit.
        /// </summary>
        /// <param name="itemBlockTypeID">Block type ID to add</param>
        /// <param name="amount">Amount to add</param>
        /// <returns>Overflow amount that couldn't fit</returns>
        public int AddItem(string itemBlockTypeID, int amount)
        {
            if (amount <= 0)
                return 0;

            // If slot is empty, start a new stack
            if (IsEmpty())
            {
                blockTypeID = itemBlockTypeID;
                int toAdd = UnityEngine.Mathf.Min(amount, maxStackSize);
                quantity = toAdd;
                return amount - toAdd;
            }

            // If different item type, can't add
            if (blockTypeID != itemBlockTypeID)
                return amount;

            // Add to existing stack
            int space = maxStackSize - quantity;
            int toAdd2 = UnityEngine.Mathf.Min(amount, space);
            quantity += toAdd2;
            return amount - toAdd2;
        }

        /// <summary>
        /// Removes items from this slot. Returns the amount actually removed.
        /// </summary>
        /// <param name="amount">Amount to remove</param>
        /// <returns>Amount actually removed</returns>
        public int RemoveItem(int amount)
        {
            if (IsEmpty() || amount <= 0)
                return 0;

            int toRemove = UnityEngine.Mathf.Min(amount, quantity);
            quantity -= toRemove;

            // Clear slot if empty
            if (quantity <= 0)
            {
                blockTypeID = null;
                quantity = 0;
            }

            return toRemove;
        }

        /// <summary>
        /// Clears this slot completely.
        /// </summary>
        public void Clear()
        {
            blockTypeID = null;
            quantity = 0;
        }
    }
}
