// Example usage:
//   1. Create a Canvas → Panel (horizontal layout) with a child Image named "SlotTemplate".
//   2. Add BlockSelectionBar to the Panel.
//   3. Assign your BlockDatabase asset and the SlotTemplate GameObject.
//   4. The hotbar will auto-populate slots from the database on Awake.
//   5. Keys 1–9 and mouse scroll wheel select a slot; the event fires for BuildTool/BlockPlacer.

using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Reads a <see cref="BlockDatabase"/> and renders a simple hotbar of block slots.
    /// Supports selection via number keys 1–9 and the mouse scroll wheel.
    /// Fires <see cref="OnBlockSelected"/> when the selection changes so that
    /// <see cref="Building.BlockPlacer"/> or other systems can react.
    /// </summary>
    public class BlockSelectionBar : MonoBehaviour
    {
        [Header("Data")]
        [SerializeField] private BlockDatabase blockDatabase;

        [Header("UI")]
        [SerializeField] private GameObject slotTemplate;
        [SerializeField] private int maxSlots = 9;

        [Header("Selection Colors")]
        [SerializeField] private Color selectedColor = Color.white;
        [SerializeField] private Color normalColor = new Color(1f, 1f, 1f, 0.5f);

        [Header("Label")]
        [SerializeField] private Text selectedBlockLabel;

        /// <summary>Raised whenever the player changes the selected block type.</summary>
        public System.Action<BlockType> OnBlockSelected;

        private readonly List<GameObject> _slots = new List<GameObject>();
        private readonly List<BlockType> _blocks = new List<BlockType>();
        private int _selectedIndex = 0;

        // ── Unity lifecycle ──────────────────────────────────────────────────

        private void Awake()
        {
            BuildHotbar();
        }

        private void Update()
        {
            HandleKeyInput();
            HandleScrollInput();
        }

        // ── Public API ────────────────────────────────────────────────────────

        /// <summary>Returns the currently selected <see cref="BlockType"/>, or null.</summary>
        public BlockType GetSelected()
        {
            if (_selectedIndex < 0 || _selectedIndex >= _blocks.Count)
                return null;
            return _blocks[_selectedIndex];
        }

        /// <summary>Programmatically selects a slot by zero-based index.</summary>
        public void Select(int index)
        {
            if (_blocks.Count == 0) return;
            _selectedIndex = Mathf.Clamp(index, 0, _blocks.Count - 1);
            RefreshVisuals();
            OnBlockSelected?.Invoke(GetSelected());
        }

        // ── Private helpers ───────────────────────────────────────────────────

        private void BuildHotbar()
        {
            // Clear old slots
            foreach (var go in _slots)
            {
                if (go != null) Destroy(go);
            }
            _slots.Clear();
            _blocks.Clear();

            if (blockDatabase == null || blockDatabase.blocks == null) return;
            if (slotTemplate == null) return;

            slotTemplate.SetActive(false);

            int count = Mathf.Min(blockDatabase.blocks.Length, maxSlots);
            for (int i = 0; i < count; i++)
            {
                var blockType = blockDatabase.blocks[i];
                if (blockType == null) continue;

                _blocks.Add(blockType);

                var slot = Instantiate(slotTemplate, slotTemplate.transform.parent);
                slot.name = $"Slot_{i}_{blockType.blockId}";
                slot.SetActive(true);
                _slots.Add(slot);

                // Try to set a tooltip / label via a Text child named "Label"
                foreach (Transform child in slot.transform)
                {
                    if (child.name.ToLower().Contains("label"))
                    {
                        var txt = child.GetComponent<Text>();
                        if (txt != null)
                            txt.text = blockType.displayName;
                    }
                }
            }

            RefreshVisuals();
        }

        private void HandleKeyInput()
        {
            for (int i = 0; i < _blocks.Count && i < 9; i++)
            {
                if (UnityEngine.Input.GetKeyDown(KeyCode.Alpha1 + i))
                {
                    Select(i);
                    return;
                }
            }
        }

        private void HandleScrollInput()
        {
            float scroll = UnityEngine.Input.GetAxis("Mouse ScrollWheel");
            if (scroll == 0f || _blocks.Count == 0) return;

            int next = _selectedIndex + (scroll > 0f ? -1 : 1);
            // Wrap around
            next = ((next % _blocks.Count) + _blocks.Count) % _blocks.Count;
            Select(next);
        }

        private void RefreshVisuals()
        {
            for (int i = 0; i < _slots.Count; i++)
            {
                var slot = _slots[i];
                if (slot == null) continue;

                var img = slot.GetComponent<Image>();
                if (img != null)
                    img.color = i == _selectedIndex ? selectedColor : normalColor;
            }

            if (selectedBlockLabel != null)
            {
                var selected = GetSelected();
                selectedBlockLabel.text = selected != null ? selected.displayName : string.Empty;
            }
        }
    }
}
