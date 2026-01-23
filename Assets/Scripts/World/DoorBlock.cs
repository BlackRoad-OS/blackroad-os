using UnityEngine;

namespace BlackRoad.Worldbuilder.World
{
    /// <summary>
    /// Interactive door block that can be opened and closed.
    /// Switches between open and closed models and plays sounds.
    /// </summary>
    public class DoorBlock : PhysicsBlock
    {
        [Header("Door Models")]
        [SerializeField] private GameObject _closedModel;
        [SerializeField] private GameObject _openModel;

        [Header("Door Sounds")]
        [SerializeField] private AudioClip _openSound;
        [SerializeField] private AudioClip _closeSound;

        [Header("Door State")]
        [SerializeField] private bool _isOpen = false;

        private AudioSource _audioSource;

        protected override void Awake()
        {
            base.Awake();
            _physicsType = PhysicsType.Interactive;

            // Get or add audio source
            _audioSource = GetComponent<AudioSource>();
            if (_audioSource == null)
            {
                _audioSource = gameObject.AddComponent<AudioSource>();
            }
        }

        protected override void Start()
        {
            base.Start();
            UpdateDoorState();
        }

        /// <summary>
        /// Toggles the door between open and closed states.
        /// </summary>
        public void ToggleDoor()
        {
            _isOpen = !_isOpen;
            UpdateDoorState();

            // Play sound
            if (_audioSource != null)
            {
                AudioClip clip = _isOpen ? _openSound : _closeSound;
                if (clip != null)
                {
                    _audioSource.PlayOneShot(clip);
                }
            }
        }

        /// <summary>
        /// Updates the visual state of the door based on _isOpen.
        /// </summary>
        private void UpdateDoorState()
        {
            if (_closedModel != null)
            {
                _closedModel.SetActive(!_isOpen);
            }

            if (_openModel != null)
            {
                _openModel.SetActive(_isOpen);
            }
        }

        /// <summary>
        /// Public interaction method for use by interaction systems.
        /// </summary>
        public void OnInteract()
        {
            ToggleDoor();
        }

        /// <summary>
        /// Gets whether the door is currently open.
        /// </summary>
        public bool IsOpen => _isOpen;
    }
}
