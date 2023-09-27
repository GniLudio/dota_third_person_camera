"use strict";
$.Msg("camera_follow_position.ts loaded!");
var PositionSettings;
(function (PositionSettings) {
    PositionSettings.max_speed = 5000;
    PositionSettings.speed_curve_exponent = 0.25; // 0= constant,smaller=steeper curve,higher=smoother, 1=linear
    PositionSettings.slow_down_radius = 250; // the radius in which the speed slows down exponentially
    PositionSettings.influence_of_mouse = 0.25; // how much the mouse influences the target position
    PositionSettings.free_cam_buffer_duration = 0.25; // how long the camera stays still move after using free cam
    PositionSettings.max_distance = 10000; // distance from one corner to the opposite corner of the map
    PositionSettings.only_units_on_screen = true; // whether to only use units on screen
    PositionSettings.free_cam_middle_mouse = true; // whether the camera can be moved freely with the middle mouse
    PositionSettings.free_cam_minimap = true; // whether the camera can be moved freely with the minimap
    let speed = 0;
    let last_distance = 0;
    let free_cam_buffer_timer = 0;
    function UpdateSpeed() {
        if (ActivateFreeCam()) {
            speed = 0;
            free_cam_buffer_timer = 0;
            return;
        }
        else if (free_cam_buffer_timer <= PositionSettings.free_cam_buffer_duration) {
            free_cam_buffer_timer += Game.GetGameFrameTime();
            return;
        }
        const current = new Vector(GameUI.GetCameraLookAtPosition());
        const target = GetTargetPosition();
        const diff = target.Minus(current);
        const distance = diff.Length();
        const target_speed = GetTargetSpeed(distance, PositionSettings.max_distance, PositionSettings.speed_curve_exponent, PositionSettings.max_speed);
        // if approaching target and inside the slow down radius
        if (last_distance > distance && distance < PositionSettings.slow_down_radius) {
            // slows down exponentially
            // TODO: try out other interpolations
            const b = (distance / PositionSettings.slow_down_radius) ** 2;
            const slow_speed = b * PositionSettings.max_speed;
            speed = Math.min(slow_speed, speed);
        }
        else {
            speed += (target_speed - speed) * Game.GetGameFrameTime();
            speed = Math.max(0, Math.min(PositionSettings.max_speed, speed));
        }
        last_distance = distance;
    }
    function UpdatePosition() {
        if (ActivateFreeCam())
            return;
        const current = new Vector(GameUI.GetCameraLookAtPosition());
        const target = GetTargetPosition();
        const diff = target.Minus(current);
        const dir = diff.Normalized();
        const change = dir.Mult(Game.GetGameFrameTime() * speed);
        if (change.Length() < diff.Length()) {
            const new_position = current.Add(change);
            GameUI.SetCameraTargetPosition(new_position.array, -1);
        }
        else {
            GameUI.SetCameraTargetPosition(target.array, -1);
        }
    }
    function GetTargetPosition() {
        const entities = GetRelevantEntities(PositionSettings.only_units_on_screen);
        let target_position = new Vector();
        // add entity positions
        for (const entity of entities) {
            const position = new Vector(Entities.GetAbsOrigin(entity));
            target_position = target_position.Add(position);
        }
        // add mouse position
        const raw_mouse_position = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition());
        if (raw_mouse_position) {
            const mouse_position = new Vector(raw_mouse_position);
            const mouse_influence = mouse_position.Mult(PositionSettings.influence_of_mouse);
            target_position = target_position.Add(mouse_influence);
        }
        // averages position
        const count = Math.max(1, entities.length + (raw_mouse_position ? Math.abs(PositionSettings.influence_of_mouse) : 0));
        target_position = target_position.Div(count);
        return target_position;
    }
    function ActivateFreeCam() {
        return (PositionSettings.free_cam_middle_mouse && GameUI.IsMouseDown(2)
            || PositionSettings.free_cam_minimap && GameUI.IsMouseDown(0) && FindDotaHudElement("minimap").BHasHoverStyle());
    }
    class Vector {
        constructor(vector = [0, 0, 0]) { this.array = vector; }
        Add(other) { return new Vector([this.array[0] + other.array[0], this.array[1] + other.array[1], this.array[2] + other.array[2]]); }
        Minus(other) { return new Vector([this.array[0] - other.array[0], this.array[1] - other.array[1], this.array[2] - other.array[2]]); }
        Mult(s) { return new Vector([this.array[0] * s, this.array[1] * s, this.array[2] * s]); }
        Div(s) { return new Vector([this.array[0] / s, this.array[1] / s, this.array[2] / s]); }
        Length() { return Math.sqrt(this.array[0] * this.array[0] + this.array[1] * this.array[1] + this.array[2] * this.array[2]); }
        Normalized() { return this.Div(this.Length()); }
    }
    function Update() {
        UpdateSpeed();
        UpdatePosition();
        $.Schedule(0, Update);
    }
    PositionSettings.Update = Update;
})(PositionSettings || (PositionSettings = {}));
PositionSettings.Update();
