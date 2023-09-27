function GetRoot(): Panel {
    let panel: Panel | null = $.GetContextPanel();
    while (panel!=null && panel.id!="Hud") panel = panel.GetParent();
    if (panel == null) throw new Error("Couldn't find root panel.");
    return panel;
}

function FindDotaHudElement(id: string, root: Panel = GetRoot()): Panel {
    const panel = root.FindChildTraverse(id);
    if (panel == null) throw new Error("Couldn't find panel:\t" + id);
    return panel;
}

function GetRelevantEntities(only_units_on_screen: boolean): EntityIndex[] {
    const selected_entities : EntityIndex[] = Players.GetSelectedEntities(Game.GetLocalPlayerID());
    if (selected_entities == undefined) return [];
    if (selected_entities.length == 0) return [];

    if (only_units_on_screen) {
        const on_screen_entities : EntityIndex[] = [];
        for (const entity of selected_entities) {
            const position = Entities.GetAbsOrigin(entity);
            const screen_x = Game.WorldToScreenX(position[0], position[1], position[2]);
            const screen_y = Game.WorldToScreenY(position[0], position[1], position[2]);
            if (screen_x!=-1 && screen_y!=-1) {
                on_screen_entities.push(entity);
            }
        }
        if (on_screen_entities.length>0) {
            return on_screen_entities;
        }
    }
    return selected_entities;
}


function GetTargetSpeed(distance: number, max_distance: number, speed_curve_exponent: number, max_speed: number) {
    const a = distance / max_distance;
    const a_curved = Math.pow(a, speed_curve_exponent);
    return a_curved * max_speed;
}