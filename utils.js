"use strict";
function GetRoot() {
    let panel = $.GetContextPanel();
    while (panel != null && panel.id != "Hud")
        panel = panel.GetParent();
    if (panel == null)
        throw new Error("Couldn't find root panel.");
    return panel;
}
function FindDotaHudElement(id, root = GetRoot()) {
    const panel = root.FindChildTraverse(id);
    if (panel == null)
        throw new Error("Couldn't find panel:\t" + id);
    return panel;
}
function GetRelevantEntities(only_units_on_screen) {
    const selected_entities = Players.GetSelectedEntities(Game.GetLocalPlayerID());
    if (selected_entities == undefined)
        return [];
    if (selected_entities.length == 0)
        return [];
    if (only_units_on_screen) {
        const on_screen_entities = [];
        for (const entity of selected_entities) {
            const position = Entities.GetAbsOrigin(entity);
            const screen_x = Game.WorldToScreenX(position[0], position[1], position[2]);
            const screen_y = Game.WorldToScreenY(position[0], position[1], position[2]);
            if (screen_x != -1 && screen_y != -1) {
                on_screen_entities.push(entity);
            }
        }
        if (on_screen_entities.length > 0) {
            return on_screen_entities;
        }
    }
    return selected_entities;
}
function GetTargetSpeed(distance, max_distance, speed_curve_exponent, max_speed) {
    const a = distance / max_distance;
    const a_curved = Math.pow(a, speed_curve_exponent);
    return a_curved * max_speed;
}
