// Example usage:
//   1. Create a horizontal UI Panel with 9 equal child slots (Image components).
//   2. Add BlockSelectionBar to the Panel.
//   3. Assign the BlockDatabase and BlockPlacer in the Inspector.
//   4. Press 1–9 to switch the active block, or use the mouse scroll wheel.

using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Reads a <see cref="BlockDatabase"/> and renders up to 9 selectable
    /// block slots as a horizontal hotbar UI.
    /// Scroll wheel and number keys 1-9 cycle through blocks;
    /// the active selection is forwarded to <see cref="BlockPlacer"/>.
    /// </summary>
    public class BlockSelectionBar : MonoBehaviour
    {
        [Header("Data")]
        [SerializeField] private BlockDatabase blockDatabase;

        [Header("Building")]
        [SerializeField] private BlockPlacer blockPlacer;

        [Header("Slot template")]
        [Tooltip("Inactive GameObject that acts as the UI slot template. Must be a child of this transform.")]
        [SerializeField] private GameObject slotTemplate;

        [Header("Style")]
        [SerializeField] private Color selectedColor = Color.white;
        [SerializeField] private Color normalColor = new Color(1f, 1f, 1f, 0.55f);
        [SerializeField] private int maxSlots = 9;

        /// <summary>Currently selected slot index (0-based).</summary>
        public int SelectedIndex { get; private set; } = 0;

        /// <summary>Currently selected <see cref="BlockType"/>, or null if none.</summary>
        public BlockType SelectedBlock =>
            _blocks != null && SelectedIndex >= 0 && SelectedIndex < _blocks.Count
                ? _blocks[SelectedIndex]
                : null;

        private readonly List<BlockType> _blocks = new List<BlockType>();
        private readonly List<GameObject> _slots = new List<GameObject>();
        private readonly List<Text> _slotLabels = new List<Text>();

        private void Awake()
        {
            if (blockDatabase == null)
                blockDatabase = FindObjectOfType<BlockDatabase>();

            if (blockPlacer == null)
                blockPlacer = FindObjectOfType<BlockPlacer>();

            if (slotTemplate != null)
                slotTemplate.SetActive(false);

            PopulateBlocks();
            BuildSlots();
            Refresh();
        }

        private void Update()
        {
            HandleInput();
        }

        // ─────────────────────────────────────────────────────────────────────

        private void PopulateBlocks()
        {
            _blocks.Clear();

            if (blockDatabase == null || blockDatabase.blocks == null)
                return;

            int count = 0;
            foreach (var block in blockDatabase.blocks)
            {
                if (block == null) continue;
                _blocks.Add(block);
                if (++count >= maxSlots) break;
            }
        }

        private void BuildSlots()
        {
            foreach (var go in _slots)
            {
                if (go != null)
                    Destroy(go);
            }
            _slots.Clear();
            _slotLabels.Clear();

            if (slotTemplate == null) return;

            for (int i = 0; i < _blocks.Count; i++)
            {
                var slot = Instantiate(slotTemplate, slotTemplate.transform.parent);
                slot.name = $"BlockSlot_{i}";
                slot.SetActive(true);
                _slots.Add(slot);

                // Cache label reference once at build time to avoid per-frame allocations.
                Text label = null;
                foreach (Transform child in slot.transform)
                {
                    if (child.name.IndexOf("label", System.StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        label = child.GetComponent<Text>();
                        break;
                    }
                }
                _slotLabels.Add(label);
            }
        }

        private void HandleInput()
        {
            // Number keys 1..9
            for (int i = 0; i < _slots.Count && i < 9; i++)
            {
                if (UnityEngine.Input.GetKeyDown(KeyCode.Alpha1 + i))
                {
                    Select(i);
                    return;
                }
            }

            // Scroll wheel
            float scroll = UnityEngine.Input.GetAxis("Mouse ScrollWheel");
            if (scroll > 0f)
                Select((_slots.Count == 0) ? 0 : (SelectedIndex - 1 + _slots.Count) % _slots.Count);
            else if (scroll < 0f)
                Select((_slots.Count == 0) ? 0 : (SelectedIndex + 1) % _slots.Count);
        }

        /// <summary>Selects slot at <paramref name="index"/> and updates the placer.</summary>
        public void Select(int index)
        {
            if (_blocks.Count == 0) return;

            SelectedIndex = Mathf.Clamp(index, 0, _blocks.Count - 1);
            Refresh();
            SyncPlacer();
        }

        private void Refresh()
        {
            for (int i = 0; i < _slots.Count; i++)
            {
                var slot = _slots[i];
                if (slot == null) continue;

                // Background tint
                var bg = slot.GetComponent<Image>();
                if (bg != null)
                    bg.color = i == SelectedIndex ? selectedColor : normalColor;

                // Use cached label reference (populated during BuildSlots).
                if (i < _slotLabels.Count && _slotLabels[i] != null && i < _blocks.Count && _blocks[i] != null)
                    _slotLabels[i].text = _blocks[i].displayName;
            }
        }

        private void SyncPlacer()
        {
            if (blockPlacer == null) return;

            // Forward selected block to BlockPlacer via reflection-free public API.
            // BlockPlacer exposes SetBlock so other systems can drive selection.
            blockPlacer.SetBlock(SelectedBlock);
        }
    }
}
