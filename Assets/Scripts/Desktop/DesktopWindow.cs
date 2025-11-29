using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace BlackRoad.Worldbuilder.Desktop
{
    /// <summary>
    /// Simple draggable, closable window for the "desktop" UI.
    /// Attach to the root Panel of a window and wire up title + close button.
    /// </summary>
    public class DesktopWindow : MonoBehaviour, IPointerDownHandler, IBeginDragHandler, IDragHandler
    {
        [Header("UI")]
        [SerializeField] private RectTransform headerArea;
        [SerializeField] private Button closeButton;
        [SerializeField] private Text titleText;

        private RectTransform _rect;
        private Canvas _canvas;
        private Vector2 _dragOffset;

        public string Title
        {
            get => titleText != null ? titleText.text : name;
            set { if (titleText != null) titleText.text = value; }
        }

        private void Awake()
        {
            _rect = GetComponent<RectTransform>();
            _canvas = GetComponentInParent<Canvas>();

            if (closeButton != null)
                closeButton.onClick.AddListener(Close);
        }

        public void Close()
        {
            gameObject.SetActive(false);
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            // Bring to front
            transform.SetAsLastSibling();
        }

        public void OnBeginDrag(PointerEventData eventData)
        {
            if (!IsInHeader(eventData)) return;

            RectTransformUtility.ScreenPointToLocalPointInRectangle(
                _rect,
                eventData.position,
                eventData.pressEventCamera,
                out _dragOffset);
        }

        public void OnDrag(PointerEventData eventData)
        {
            if (!IsInHeader(eventData)) return;
            if (_canvas == null) return;

            Vector2 localPoint;
            if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
                    _canvas.transform as RectTransform,
                    eventData.position,
                    eventData.pressEventCamera,
                    out localPoint))
            {
                _rect.localPosition = localPoint - _dragOffset;
            }
        }

        private bool IsInHeader(PointerEventData eventData)
        {
            if (headerArea == null) return true;

            return RectTransformUtility.RectangleContainsScreenPoint(
                headerArea,
                eventData.position,
                eventData.pressEventCamera);
        }
    }
}
