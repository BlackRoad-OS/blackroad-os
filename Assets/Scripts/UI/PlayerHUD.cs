using UnityEngine;
using UnityEngine.UI;

namespace BlackRoad.Worldbuilder.UI
{
    /// <summary>
    /// Player HUD displaying current block selection and game information.
    /// Shows the currently selected block name and icon.
    /// </summary>
    public class PlayerHUD : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private Text blockNameText;
        [SerializeField] private Image blockIconImage;
        [SerializeField] private Text modeText;

        [Header("References")]
        [SerializeField] private Building.BlockPlacer blockPlacer;
        [SerializeField] private Player.PlayerController playerController;

        [Header("Settings")]
        [SerializeField] private bool showMode = true;
        [SerializeField] private bool showBlockInfo = true;

        private Building.BlockType _lastDisplayedBlock;

        private void Start()
        {
            if (blockPlacer == null)
                blockPlacer = FindObjectOfType<Building.BlockPlacer>();

            if (playerController == null)
                playerController = FindObjectOfType<Player.PlayerController>();
        }

        private void Update()
        {
            UpdateBlockDisplay();
            UpdateModeDisplay();
        }

        /// <summary>
        /// Update the currently selected block display
        /// </summary>
        private void UpdateBlockDisplay()
        {
            if (!showBlockInfo || blockPlacer == null)
                return;

            var currentBlock = blockPlacer.CurrentBlock;

            // Only update if the block changed
            if (currentBlock != _lastDisplayedBlock)
            {
                _lastDisplayedBlock = currentBlock;

                if (currentBlock != null)
                {
                    // Update block name
                    if (blockNameText != null)
                    {
                        blockNameText.text = currentBlock.displayName;
                    }

                    // Update block icon
                    if (blockIconImage != null)
                    {
                        if (currentBlock.icon != null)
                        {
                            blockIconImage.sprite = currentBlock.icon;
                            blockIconImage.color = Color.white;
                            blockIconImage.enabled = true;
                        }
                        else
                        {
                            // No icon - show color or hide
                            blockIconImage.sprite = null;
                            blockIconImage.color = currentBlock.gizmoColor;
                            blockIconImage.enabled = true;
                        }
                    }
                }
                else
                {
                    // No block selected
                    if (blockNameText != null)
                    {
                        blockNameText.text = "No Block";
                    }

                    if (blockIconImage != null)
                    {
                        blockIconImage.enabled = false;
                    }
                }
            }
        }

        /// <summary>
        /// Update the movement mode display (fly/grounded)
        /// </summary>
        private void UpdateModeDisplay()
        {
            if (!showMode || modeText == null || playerController == null)
                return;

            string mode = playerController.IsFlying ? "FLY MODE" : "GROUNDED";
            modeText.text = mode;
        }

        /// <summary>
        /// Show the HUD
        /// </summary>
        public void Show()
        {
            gameObject.SetActive(true);
        }

        /// <summary>
        /// Hide the HUD
        /// </summary>
        public void Hide()
        {
            gameObject.SetActive(false);
        }
    }
}
