$.Msg("camera_follow_position.ts loaded!");

namespace PositionSettings {
    export let max_speed = 5000;
    export let speed_curve_exponent = 0.25; // 0= constant,smaller=steeper curve,higher=smoother, 1=linear
    export let slow_down_radius = 250; // the radius in which the speed slows down exponentially
    export let influence_of_mouse = 0.25; // how much the mouse influences the target position
    export let free_cam_buffer_duration = 0.25; // how long the camera stays still move after using free cam
    export let max_distance = 10000; // distance from one corner to the opposite corner of the map
    export let only_units_on_screen = true; // whether to only use units on screen
    export let free_cam_middle_mouse = true; // whether the camera can be moved freely with the middle mouse
    export let free_cam_minimap = true; // whether the camera can be moved freely with the minimap

    let speed = 0;
    let last_distance = 0;
    let free_cam_buffer_timer = 0;

    function UpdateSpeed() {
        if (ActivateFreeCam()) {
            speed = 0;
            free_cam_buffer_timer = 0;
            return;
        } else if (free_cam_buffer_timer <= free_cam_buffer_duration) {
            free_cam_buffer_timer += Game.GetGameFrameTime();
            return;
        }

        const current = new Vector(GameUI.GetCameraLookAtPosition());
        const target = GetTargetPosition();
        const diff = target.Minus(current);
        const distance = diff.Length();
        const target_speed = GetTargetSpeed(distance, max_distance, speed_curve_exponent, max_speed);

        // if approaching target and inside the slow down radius
        if (last_distance > distance && distance < slow_down_radius) {
            // slows down exponentially
            // TODO: try out other interpolations
            const b = (distance / slow_down_radius)**2;
            const slow_speed = b * max_speed;
            speed = Math.min(slow_speed, speed);
        }
        else {
            speed += (target_speed - speed) * Game.GetGameFrameTime();
            speed = Math.max(0, Math.min(max_speed, speed));
        }
        last_distance = distance;
    }

    function UpdatePosition() {
        if (ActivateFreeCam()) return;
        const current = new Vector(GameUI.GetCameraLookAtPosition());
        const target = GetTargetPosition();
        const diff = target.Minus(current);
        const dir =  diff.Normalized();
        const change = dir.Mult(Game.GetGameFrameTime()*speed);
        if (change.Length() < diff.Length()) {
            const new_position = current.Add(change);
            GameUI.SetCameraTargetPosition(new_position.array, -1);
        } else {
            GameUI.SetCameraTargetPosition(target.array, -1);
        }
    }

    function GetTargetPosition(): Vector {
        const entities = GetRelevantEntities(only_units_on_screen);

        let target_position: Vector = new Vector();
        // add entity positions
        for (const entity of entities) {
            const position = new Vector(Entities.GetAbsOrigin(entity));
            target_position = target_position.Add(position);
        }
        // add mouse position
        const raw_mouse_position = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition())
        if (raw_mouse_position) {
            const mouse_position = new Vector(raw_mouse_position);
            const mouse_influence = mouse_position.Mult(influence_of_mouse);
            target_position = target_position.Add(mouse_influence);
        }
        // averages position
        const count = Math.max(1, entities.length + (raw_mouse_position ? Math.abs(influence_of_mouse) : 0));
        target_position = target_position.Div(count);

        return target_position;
    }

    function ActivateFreeCam() {
        return (free_cam_middle_mouse && GameUI.IsMouseDown(2)
            || free_cam_minimap && GameUI.IsMouseDown(0) && FindDotaHudElement("minimap").BHasHoverStyle());
    }

    class Vector {
        public array: [number, number, number];
        constructor(vector: [number, number, number] = [0,0,0]) { this.array = vector; }
        public Add(other: Vector): Vector {return new Vector([this.array[0]+other.array[0],this.array[1]+other.array[1],this.array[2]+other.array[2]]);}
        public Minus(other: Vector): Vector { return new Vector([this.array[0]-other.array[0],this.array[1]-other.array[1],this.array[2]-other.array[2]]); }
        public Mult(s: number): Vector { return new Vector([this.array[0]*s,this.array[1]*s,this.array[2]*s]); }
        public Div(s: number): Vector { return new Vector([this.array[0]/s,this.array[1]/s,this.array[2]/s]); }
        public Length(): number { return Math.sqrt(this.array[0]*this.array[0] + this.array[1]*this.array[1] + this.array[2]*this.array[2]); }
        public Normalized(): Vector { return this.Div(this.Length()); }
    }

    export function Update(): void {
        UpdateSpeed();
        UpdatePosition();
        $.Schedule(0, Update);
    }

}

PositionSettings.Update();