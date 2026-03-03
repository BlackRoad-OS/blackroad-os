using UnityEngine;
using BlackRoad.Worldbuilder.World;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// Raycast-based block placement and removal system.
    /// Left click to place, hold right click to break (with hardness-based timing).
    /// Use scroll wheel or number keys to select blocks.
    /// </summary>
    [RequireComponent(typeof(Camera))]
    public class BlockPlacer : MonoBehaviour
    {
        [Header("Refs")]
        public WorldGrid worldGrid;
        public BlockDatabase blockDatabase;
        
        [Header("Inventory")]
        [SerializeField] private Inventory.InventoryManager _inventoryManager;

        [Header("Placement")]
        public float maxDistance = 50f;
        public LayerMask placementMask = ~0;

        [Header("Block Selection")]
        [Tooltip("Current selected block index (0-8 for keys 1-9)")]
        [SerializeField] private int selectedBlockIndex = 0;

        [Header("Breaking")]
        [Tooltip("Visual feedback for breaking progress (optional)")]
        [SerializeField] private bool showBreakProgress = true;

        private Camera _camera;
        private BlockType _currentBlock;

        /// <summary>
        /// Programmatically set the active block type.
        /// Called by <see cref="BlackRoad.Worldbuilder.UI.BlockSelectionBar"/> when the player changes selection.
        /// </summary>
        public void SetBlock(BlockType block) => _currentBlock = block;

        private void Awake()
        {
            _camera = GetComponent<Camera>();
        }

        private void Start()
        {
            if (blockDatabase != null)
            {
                UpdateSelectedBlock();
            }

            if (worldGrid == null)
            {
                // Try to find one in the scene
                worldGrid = FindObjectOfType<WorldGrid>();
            }

            if (_inventoryManager == null)
            {
                // Try to find one in the scene
                _inventoryManager = FindObjectOfType<Inventory.InventoryManager>();
            }
        }

        private void Update()
        {
            if (_camera == null || worldGrid == null || blockDatabase == null)
                return;

            HandleBlockSelection();
            HandlePlacement();
            HandleBreaking();
        }

        /// <summary>
        /// Handle number keys and scroll wheel for block selection
        /// </summary>
        private void HandleBlockSelection()
        {
            // Number keys 1-9
            for (int i = 0; i < 9; i++)
            {
                if (UnityEngine.Input.GetKeyDown(KeyCode.Alpha1 + i))
                {
                    selectedBlockIndex = i;
                    UpdateSelectedBlock();
                }
            }

            // Scroll wheel
            float scroll = UnityEngine.Input.GetAxis("Mouse ScrollWheel");
            if (Mathf.Abs(scroll) > 0.01f)
            {
                if (scroll > 0)
                {
                    selectedBlockIndex--;
                    if (selectedBlockIndex < 0)
                        selectedBlockIndex = Mathf.Min(8, blockDatabase.Count - 1);
                }
                else
                {
                    selectedBlockIndex++;
                    if (selectedBlockIndex >= blockDatabase.Count || selectedBlockIndex > 8)
                        selectedBlockIndex = 0;
                }

                UpdateSelectedBlock();
            }
        }

        /// <summary>
        /// Update the currently selected block type
        /// </summary>
        private void UpdateSelectedBlock()
        {
            _currentBlock = blockDatabase.GetAtIndex(selectedBlockIndex);
        }

        /// <summary>
        /// Handle left click to place blocks
        /// </summary>
        private void HandlePlacement()
        {
            if (_currentBlock == null)
                return;

            Ray ray = _camera.ScreenPointToRay(UnityEngine.Input.mousePosition);

            if (Physics.Raycast(ray, out RaycastHit hit, maxDistance, placementMask))
            {
                // Place with left click (instant)
                if (UnityEngine.Input.GetMouseButtonDown(0))
                {
                    HandlePlacement(hit);
                }
            }
        }

        /// <summary>
        /// Handle right click to break blocks with hardness-based timing
        /// </summary>
        private void HandleBreaking()
        {
            Ray ray = _camera.ScreenPointToRay(UnityEngine.Input.mousePosition);

            if (Physics.Raycast(ray, out RaycastHit hit, maxDistance, placementMask))
            {
                Vector3Int gridPos = worldGrid.WorldToGrid(hit.point - hit.normal * 0.5f);

                // Start breaking on right mouse button down
                if (UnityEngine.Input.GetMouseButtonDown(1))
                {
                    if (worldGrid.TryGetBlock(gridPos, out GameObject block))
                    {
                        _isBreaking = true;
                        _breakProgress = 0f;
                        _breakingGridPos = gridPos;

                        // Get hardness from the block type
                        // For now, use a default hardness since we can't easily get the BlockType from the GameObject
                        // In a real implementation, you'd store the BlockType reference on the block GameObject
                        _currentHardness = 1f; // Default hardness
                    }
                }

                // Continue breaking while holding right mouse button
                if (UnityEngine.Input.GetMouseButton(1) && _isBreaking)
                {
                    // Check if still targeting the same block
                    if (gridPos == _breakingGridPos)
                    {
                        if (_currentHardness <= 0f)
                        {
                            // Instant break
                            worldGrid.RemoveBlock(_breakingGridPos);
                            _isBreaking = false;
                        }
                        else
                        {
                            // Progress based on hardness
                            _breakProgress += Time.deltaTime / _currentHardness;

                            if (_breakProgress >= 1f)
                            {
                                // Block broken!
                                worldGrid.RemoveBlock(_breakingGridPos);
                                _isBreaking = false;
                                _breakProgress = 0f;
                            }
                        }
                    }
                    else
                    {
                        // Moved to a different block, reset
                        _isBreaking = false;
                        _breakProgress = 0f;
                    }
                }

                // Release right mouse button
                if (UnityEngine.Input.GetMouseButtonUp(1))
                {
                    _isBreaking = false;
                    _breakProgress = 0f;
                }
            }
            else
            {
                // Not targeting anything
                if (_isBreaking)
                {
                    _isBreaking = false;
                    _breakProgress = 0f;
                }
            }
        }

        /// <summary>
        /// Set the selected block index programmatically
        /// </summary>
        public void SetSelectedBlockIndex(int index)
        {
            if (index >= 0 && index < blockDatabase.Count)
            {
                selectedBlockIndex = index;
                UpdateSelectedBlock();
            }
        }

        /// <summary>
        /// Handles block placement with inventory integration.
        /// </summary>
        private void HandlePlacement(RaycastHit hit)
        {
            if (_currentBlock == null) return;

            // Check inventory
            if (_inventoryManager != null && !_inventoryManager.HasItem(_currentBlock.blockId, 1))
            {
                Debug.Log($"[BlockPlacer] Not enough {_currentBlock.displayName} in inventory.");
                return; // Not enough blocks in inventory
            }

            Vector3Int gridPos = worldGrid.WorldToGrid(hit.point + hit.normal * 0.5f);
            GameObject placed = worldGrid.PlaceBlock(gridPos, _currentBlock);

            // Remove from inventory if placement succeeded
            if (placed != null && _inventoryManager != null)
            {
                _inventoryManager.RemoveItem(_currentBlock.blockId, 1);
            }
        }

        /// <summary>
        /// Handles block removal with inventory integration.
        /// </summary>
        private void HandleRemoval(RaycastHit hit)
        {
            Vector3Int gridPos = worldGrid.WorldToGrid(hit.point - hit.normal * 0.5f);
            
            // Get the block type before removing
            BlockType blockType = null;
            if (worldGrid.TryGetBlock(gridPos, out GameObject blockObj) && blockObj != null)
            {
                // Try to get block type from the object name or tag
                // This is a simplified approach - in production you might store the type differently
                string blockName = blockObj.name.Replace("(Clone)", "").Trim();
                if (blockDatabase != null)
                {
                    // Try to find matching block type
                    foreach (var bt in blockDatabase.blocks)
                    {
                        if (bt != null && bt.prefab != null)
                        {
                            string prefabName = bt.prefab.name;
                            if (blockName.Contains(prefabName) || prefabName.Contains(blockName))
                            {
                                blockType = bt;
                                break;
                            }
                        }
                    }
                }
            }

            // Remove the block
            bool removed = worldGrid.RemoveBlock(gridPos);

            // Add to inventory if removal succeeded
            if (removed && _inventoryManager != null && blockType != null)
            {
                _inventoryManager.AddItem(blockType.blockId, 1);
            }
        }

        /// <summary>
        /// Handles interaction with interactive blocks (doors, etc).
        /// </summary>
        private void HandleInteraction(RaycastHit hit)
        {
            Vector3Int gridPos = worldGrid.WorldToGrid(hit.point - hit.normal * 0.5f);
            
            if (worldGrid.TryGetBlock(gridPos, out GameObject blockObj) && blockObj != null)
            {
                // Check for door block
                var door = blockObj.GetComponent<DoorBlock>();
                if (door != null)
                {
                    door.OnInteract();
                    return;
                }

                // Can add more interactive block types here
            }
        }

        /// <summary>
        /// Sets the current block type to place.
        /// </summary>
        public void SetCurrentBlock(BlockType blockType)
        {
            if (blockType != null)
            {
                _currentBlock = blockType;
            }
        }

        /// <summary>
        /// Gets the current block type being placed.
        /// </summary>
        public BlockType GetCurrentBlock()
        {
            return _currentBlock;
        }
    }
}
