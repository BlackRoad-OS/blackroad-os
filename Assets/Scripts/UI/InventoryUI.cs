using System.Collections.Generic;
using UnityEngine;
using BlackRoad.Worldbuilder.Building;
using BlackRoad.Worldbuilder.Inventory;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Main inventory UI controller that manages the inventory display.
    /// Handles opening/closing, refreshing slots, and user interactions.
    /// </summary>
    public class InventoryUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private InventoryManager inventoryManager;
        [SerializeField] private BlockDatabase blockDatabase;
        [SerializeField] private GameObject inventoryPanel;

        [Header("Slot Settings")]
        [SerializeField] private GameObject slotPrefab;
        [SerializeField] private Transform slotContainer;

        [Header("Input")]
        [SerializeField] private KeyCode toggleKey = KeyCode.Tab;

        private List<InventorySlotUI> _slotUIs = new List<InventorySlotUI>();
        private bool _isOpen = false;

        private void Start()
        {
            // Find references if not set
            if (inventoryManager == null)
                inventoryManager = FindObjectOfType<InventoryManager>();

            if (blockDatabase == null)
            {
                // Try to find it in resources or scene
                blockDatabase = Resources.Load<BlockDatabase>("BlockDatabase");
            }

            // Initialize UI
            InitializeSlotUIs();

            // Subscribe to inventory events
            if (inventoryManager != null)
            {
                inventoryManager.OnInventoryChanged.AddListener(OnSlotChanged);
            }

            // Start closed
            SetInventoryActive(false);
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (inventoryManager != null)
            {
                inventoryManager.OnInventoryChanged.RemoveListener(OnSlotChanged);
            }
        }

        private void Update()
        {
            // Toggle inventory with Tab key
            if (Input.GetKeyDown(toggleKey))
            {
                ToggleInventory();
            }
        }

        /// <summary>
        /// Initializes all slot UI elements from the prefab.
        /// </summary>
        private void InitializeSlotUIs()
        {
            if (slotPrefab == null || slotContainer == null || inventoryManager == null)
            {
                Debug.LogWarning("[InventoryUI] Missing references for slot initialization.");
                return;
            }

            // Clear existing slots
            foreach (var slot in _slotUIs)
            {
                if (slot != null)
                    Destroy(slot.gameObject);
            }
            _slotUIs.Clear();

            // Create slot UIs
            for (int i = 0; i < inventoryManager.InventorySize; i++)
            {
                GameObject slotObj = Instantiate(slotPrefab, slotContainer);
                InventorySlotUI slotUI = slotObj.GetComponent<InventorySlotUI>();
                
                if (slotUI != null)
                {
                    slotUI.Initialize(i, this);
                    _slotUIs.Add(slotUI);
                }
                else
                {
                    Debug.LogWarning($"[InventoryUI] Slot prefab missing InventorySlotUI component at index {i}");
                }
            }

            // Initial refresh
            RefreshAllSlots();
        }

        /// <summary>
        /// Toggles the inventory UI open/closed.
        /// </summary>
        public void ToggleInventory()
        {
            _isOpen = !_isOpen;
            SetInventoryActive(_isOpen);
        }

        /// <summary>
        /// Opens the inventory UI.
        /// </summary>
        public void OpenInventory()
        {
            _isOpen = true;
            SetInventoryActive(true);
        }

        /// <summary>
        /// Closes the inventory UI.
        /// </summary>
        public void CloseInventory()
        {
            _isOpen = false;
            SetInventoryActive(false);
        }

        /// <summary>
        /// Sets the inventory panel active state and manages cursor lock.
        /// </summary>
        /// <param name="active">Whether to show the inventory</param>
        private void SetInventoryActive(bool active)
        {
            if (inventoryPanel != null)
            {
                inventoryPanel.SetActive(active);
            }

            // Manage cursor lock state
            if (active)
            {
                Cursor.lockState = CursorLockMode.None;
                Cursor.visible = true;
            }
            else
            {
                Cursor.lockState = CursorLockMode.Locked;
                Cursor.visible = false;
            }
        }

        /// <summary>
        /// Refreshes all inventory slot displays.
        /// </summary>
        public void RefreshAllSlots()
        {
            if (inventoryManager == null)
                return;

            for (int i = 0; i < _slotUIs.Count; i++)
            {
                var slot = inventoryManager.GetSlot(i);
                if (slot != null && _slotUIs[i] != null)
                {
                    _slotUIs[i].UpdateDisplay(slot, blockDatabase);
                }
            }
        }

        /// <summary>
        /// Called when a specific slot changes in the inventory.
        /// </summary>
        /// <param name="slotIndex">Index of the changed slot</param>
        public void OnSlotChanged(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= _slotUIs.Count)
                return;

            var slot = inventoryManager?.GetSlot(slotIndex);
            if (slot != null && _slotUIs[slotIndex] != null)
            {
                _slotUIs[slotIndex].UpdateDisplay(slot, blockDatabase);
            }
        }

        /// <summary>
        /// Handles slot click events.
        /// </summary>
        /// <param name="slotIndex">Index of the clicked slot</param>
        public void OnSlotClicked(int slotIndex)
        {
            // Future: Implement drag-and-drop or item selection logic here
            Debug.Log($"[InventoryUI] Slot {slotIndex} clicked");
        }
    }
}
