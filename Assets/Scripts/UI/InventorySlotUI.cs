using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// UI component for a single inventory slot.
    /// Displays the block icon, quantity, and handles click events.
    /// </summary>
    public class InventorySlotUI : MonoBehaviour, IPointerClickHandler
    {
        [Header("UI References")]
        [SerializeField] private Image backgroundImage;
        [SerializeField] private Image iconImage;
        [SerializeField] private Text quantityText;

        private int _slotIndex;
        private InventoryUI _inventoryUI;

        // Colors for slot states
        private static readonly Color EmptyColor = new Color(0.2f, 0.2f, 0.2f, 0.5f);
        private static readonly Color FilledColor = new Color(0.3f, 0.3f, 0.3f, 0.8f);

        /// <summary>
        /// Initializes this slot UI with its index and parent UI reference.
        /// </summary>
        /// <param name="slotIndex">The index of this slot in the inventory</param>
        /// <param name="inventoryUI">Reference to the parent InventoryUI</param>
        public void Initialize(int slotIndex, InventoryUI inventoryUI)
        {
            _slotIndex = slotIndex;
            _inventoryUI = inventoryUI;
        }

        /// <summary>
        /// Updates the visual display of this slot.
        /// </summary>
        /// <param name="slot">The inventory slot data</param>
        /// <param name="blockDatabase">Block database for looking up icons</param>
        public void UpdateDisplay(Inventory.InventorySlot slot, BlockDatabase blockDatabase)
        {
            if (slot == null || slot.IsEmpty())
            {
                // Empty slot
                if (backgroundImage != null)
                    backgroundImage.color = EmptyColor;
                
                if (iconImage != null)
                {
                    iconImage.enabled = false;
                    iconImage.sprite = null;
                }
                
                if (quantityText != null)
                {
                    quantityText.enabled = false;
                    quantityText.text = "";
                }
            }
            else
            {
                // Filled slot
                if (backgroundImage != null)
                    backgroundImage.color = FilledColor;

                // Get block type for icon
                BlockType blockType = null;
                if (blockDatabase != null)
                {
                    blockType = blockDatabase.Get(slot.blockTypeID);
                }

                if (iconImage != null)
                {
                    if (blockType != null && blockType.icon != null)
                    {
                        iconImage.enabled = true;
                        iconImage.sprite = blockType.icon;
                    }
                    else
                    {
                        // No icon available
                        iconImage.enabled = false;
                        iconImage.sprite = null;
                    }
                }

                if (quantityText != null)
                {
                    quantityText.enabled = true;
                    quantityText.text = slot.quantity > 1 ? slot.quantity.ToString() : "";
                }
            }
        }

        /// <summary>
        /// Handles pointer click events on this slot.
        /// </summary>
        /// <param name="eventData">Pointer event data</param>
        public void OnPointerClick(PointerEventData eventData)
        {
            if (_inventoryUI != null)
            {
                _inventoryUI.OnSlotClicked(_slotIndex);
            }
        }
    }
}
