using System.Collections;
using UnityEngine;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.World
{
    /// <summary>
    /// Physics block that falls when unsupported (sand, gravel).
    /// Checks for support below and falls if none exists.
    /// </summary>
    public class FallingBlock : PhysicsBlock
    {
        [Header("Falling Settings")]
        [SerializeField] private float _fallSpeed = 2f;
        [SerializeField] private string _blockTypeID = "sand";

        private bool _isFalling = false;

        protected override void Awake()
        {
            base.Awake();
            _physicsType = PhysicsType.Falling;
        }

        protected override void UpdatePhysics()
        {
            base.UpdatePhysics();

            if (_isFalling)
                return;

            // Check if there's support below
            Vector3Int belowPos = _gridPosition + Vector3Int.down;
            bool hasSupport = HasBlockAt(belowPos);

            if (!hasSupport)
            {
                StartFalling();
            }
        }

        /// <summary>
        /// Initiates the falling animation.
        /// </summary>
        private void StartFalling()
        {
            if (_isFalling)
                return;

            _isFalling = true;
            StartCoroutine(FallCoroutine());
        }

        /// <summary>
        /// Coroutine that handles the smooth falling animation.
        /// </summary>
        /// <returns>Coroutine enumerator</returns>
        private IEnumerator FallCoroutine()
        {
            if (_worldGrid == null)
            {
                _isFalling = false;
                yield break;
            }

            // Remove from current position
            Vector3Int startPos = _gridPosition;
            _worldGrid.RemoveBlock(startPos);

            // Find landing position
            Vector3Int landingPos = FindLandingPosition(startPos);
            Vector3 targetWorldPos = _worldGrid.GridToWorld(landingPos);

            // Animate falling
            while (Vector3.Distance(transform.position, targetWorldPos) > 0.1f)
            {
                transform.position = Vector3.MoveTowards(
                    transform.position,
                    targetWorldPos,
                    _fallSpeed * Time.deltaTime
                );
                yield return null;
            }

            // Snap to final position
            transform.position = targetWorldPos;
            _gridPosition = landingPos;

            // Get block type and place at new position
            BlockType blockType = null;
            if (_worldGrid.TryGetComponent<BlockDatabase>(out var database))
            {
                blockType = database.Get(_blockTypeID);
            }

            // If we can't find database, try to find it in scene
            if (blockType == null)
            {
                var db = FindObjectOfType<BlockDatabase>();
                if (db != null)
                {
                    blockType = db.Get(_blockTypeID);
                }
            }

            // Place block at landing position
            if (blockType != null)
            {
                _worldGrid.PlaceBlock(landingPos, blockType);
            }

            // Destroy this falling instance
            Destroy(gameObject);
        }

        /// <summary>
        /// Finds the position where this block will land by checking downward.
        /// </summary>
        /// <param name="startPos">Starting grid position</param>
        /// <returns>Landing grid position</returns>
        private Vector3Int FindLandingPosition(Vector3Int startPos)
        {
            Vector3Int checkPos = startPos;
            
            // Move down until we hit something
            while (checkPos.y > 0)
            {
                Vector3Int belowPos = checkPos + Vector3Int.down;
                
                if (HasBlockAt(belowPos))
                {
                    // Found support, land here
                    return checkPos;
                }
                
                checkPos = belowPos;
            }

            // Hit bottom of world
            return new Vector3Int(startPos.x, 0, startPos.z);
        }
    }
}
