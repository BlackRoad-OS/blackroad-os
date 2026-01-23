using UnityEngine;
using UnityEngine.UI;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Hotbar UI for block selection with 1-9 key support and scroll wheel.
    /// Displays block icons and highlights the currently selected block.
    /// </summary>
    public class BlockSelectionBar : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Building.BlockDatabase blockDatabase;
        [SerializeField] private Building.BlockPlacer blockPlacer;

        [Header("UI Elements")]
        [SerializeField] private GameObject slotPrefab;
        [SerializeField] private Transform slotsContainer;
        [SerializeField] private Color normalColor = new Color(0.3f, 0.3f, 0.3f, 0.8f);
        [SerializeField] private Color selectedColor = new Color(1f, 1f, 1f, 1f);

        [Header("Settings")]
        [SerializeField] private int maxSlots = 9;

        private Image[] _slotBackgrounds;
        private Image[] _slotIcons;
        private int _currentSelection = 0;

        private void Start()
        {
            if (blockDatabase == null && Core.GameManager.Instance != null)
                blockDatabase = Core.GameManager.Instance.blockDatabase;

            if (blockPlacer == null)
                blockPlacer = FindObjectOfType<Building.BlockPlacer>();

            InitializeSlots();
        }

        private void Update()
        {
            UpdateSelection();
        }

        /// <summary>
        /// Initialize the hotbar slots from the block database
        /// </summary>
        private void InitializeSlots()
        {
            if (blockDatabase == null || slotsContainer == null)
            {
                Debug.LogWarning("[BlockSelectionBar] Missing references for initialization.");
                return;
            }

            // Clear existing slots
            foreach (Transform child in slotsContainer)
            {
                Destroy(child.gameObject);
            }

            int slotCount = Mathf.Min(maxSlots, blockDatabase.Count);
            _slotBackgrounds = new Image[slotCount];
            _slotIcons = new Image[slotCount];

            // Create slots for each block
            for (int i = 0; i < slotCount; i++)
            {
                Building.BlockType blockType = blockDatabase.GetAtIndex(i);
                if (blockType == null)
                    continue;

                GameObject slotObj;
                if (slotPrefab != null)
                {
                    slotObj = Instantiate(slotPrefab, slotsContainer);
                }
                else
                {
                    // Create a basic slot if no prefab is provided
                    slotObj = new GameObject($"Slot_{i}");
                    slotObj.transform.SetParent(slotsContainer);
                    
                    Image bg = slotObj.AddComponent<Image>();
                    bg.color = normalColor;
                    
                    GameObject iconObj = new GameObject("Icon");
                    iconObj.transform.SetParent(slotObj.transform);
                    Image icon = iconObj.AddComponent<Image>();
                    icon.rectTransform.anchorMin = new Vector2(0.1f, 0.1f);
                    icon.rectTransform.anchorMax = new Vector2(0.9f, 0.9f);
                    icon.rectTransform.offsetMin = Vector2.zero;
                    icon.rectTransform.offsetMax = Vector2.zero;
                }

                // Get or create the icon image
                Image slotBg = slotObj.GetComponent<Image>();
                Image slotIcon = slotObj.transform.Find("Icon")?.GetComponent<Image>();

                if (slotIcon == null)
                {
                    slotIcon = slotObj.GetComponentInChildren<Image>();
                    if (slotIcon == slotBg) // Same component
                    {
                        GameObject iconObj = new GameObject("Icon");
                        iconObj.transform.SetParent(slotObj.transform);
                        slotIcon = iconObj.AddComponent<Image>();
                    }
                }

                _slotBackgrounds[i] = slotBg;
                _slotIcons[i] = slotIcon;

                // Set the block icon
                if (slotIcon != null && blockType.icon != null)
                {
                    slotIcon.sprite = blockType.icon;
                    slotIcon.color = Color.white;
                }
                else if (slotIcon != null)
                {
                    // No icon available - use a color or placeholder
                    slotIcon.color = blockType.gizmoColor;
                }
            }

            UpdateVisuals();
        }

        /// <summary>
        /// Update the current selection based on block placer
        /// </summary>
        private void UpdateSelection()
        {
            if (blockPlacer == null)
                return;

            // Find which block is currently selected
            var currentBlock = blockPlacer.CurrentBlock;
            if (currentBlock == null)
                return;

            for (int i = 0; i < Mathf.Min(maxSlots, blockDatabase.Count); i++)
            {
                if (blockDatabase.GetAtIndex(i) == currentBlock)
                {
                    if (_currentSelection != i)
                    {
                        _currentSelection = i;
                        UpdateVisuals();
                    }
                    break;
                }
            }
        }

        /// <summary>
        /// Update the visual state of all slots
        /// </summary>
        private void UpdateVisuals()
        {
            if (_slotBackgrounds == null)
                return;

            for (int i = 0; i < _slotBackgrounds.Length; i++)
            {
                if (_slotBackgrounds[i] != null)
                {
                    _slotBackgrounds[i].color = (i == _currentSelection) ? selectedColor : normalColor;
                }
            }
        }

        /// <summary>
        /// Set the selected slot index
        /// </summary>
        public void SetSelection(int index)
        {
            if (index >= 0 && index < maxSlots && blockPlacer != null)
            {
                _currentSelection = index;
                blockPlacer.SetSelectedBlockIndex(index);
                UpdateVisuals();
            }
        }
    }
}
