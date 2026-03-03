namespace BlackRoad.Worldbuilder.Core
{
    /// <summary>
    /// Enum defining the possible game states for the worldbuilder.
    /// Used by GameManager to control game flow and UI.
    /// </summary>
    public enum GameState
    {
        /// <summary>
        /// Main menu state - showing main menu UI, gameplay paused
        /// </summary>
        MainMenu,
        
        /// <summary>
        /// Active gameplay state - player can move, build, interact
        /// </summary>
        Playing,
        
        /// <summary>
        /// Paused state - gameplay frozen, pause menu visible
        /// </summary>
        Paused
    }
}
