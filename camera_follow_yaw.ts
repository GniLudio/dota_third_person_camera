$.Msg("camera_follow_yaw.ts")

namespace YawSettings {
    export let max_speed =  180;
    export let speed_curve_exponent =  3; // 0= constant,smaller=steeper curve,higher=smoother, 1=linear
    export let slow_down_angle =  10; // the radius in which the speed slows down exponentially
    export let only_units_on_screen =  true; // whether to only use units on screen
    export let max_angle =  180; // distance from one corner to the opposite corner of the map

    let speed = 0;
    let last_distance = 0;


    function UpdateSpeed() {
        const current = new Angle(GameUI.GetCameraYaw());
        const target = GetTargetYaw();
        const diff = current.Diff(target);
        const distance = Math.abs(diff);
        const target_speed = GetTargetSpeed(distance, max_angle, speed_curve_exponent, max_speed);


        // if approaching target and inside slow down angle
        if (last_distance > distance && distance < slow_down_angle) {
            // slows down exponentially
            // TODO: try out other interpolations
            const b = (distance / slow_down_angle)**2;
            const slow_speed = b * max_speed;
            speed = Math.min(slow_speed, speed);
        }
        else {
            speed += (target_speed - speed) * Game.GetGameFrameTime();
            speed = Math.max(0, Math.min(max_speed, speed));
        }
        last_distance = distance;
    }

    function UpdateYaw() {
        const current = new Angle(GameUI.GetCameraYaw());
        const target = GetTargetYaw();
        const diff = current.Diff(target);
        const dir = Math.sign(diff);
        const change = Game.GetGameFrameTime()*speed;
        if (change < Math.abs(diff)) {
            const new_angle = current.angle + dir * change;
            GameUI.SetCameraYaw(new_angle);
        } else {
            GameUI.SetCameraYaw(target.angle);
        }
    }

    function GetTargetYaw(): Angle {
        const entities = GetRelevantEntities(only_units_on_screen);

        let target_angle = 0;
        // add entity angles
        for (const entity of entities) {
            const angle = Entities.GetAbsAngles(entity)[1];
            target_angle += angle;
        }
        // averages angle
        target_angle /= Math.max(entities.length,1);
        // look from behind
        target_angle += 90;

        return new Angle(target_angle);
    }

    class Angle {
        public angle: number;
        constructor(angle: number = 0) {
            this.angle = angle;
            if (this.angle <= 0) this.angle += 360;
            if (this.angle > 360) this.angle -= 360;
            if (this.angle <= 0 || this.angle > 360) {
                throw new Error("Unvalid Angle " + this.angle)
            }
        }
        public Add(other: Angle): Angle { return new Angle(this.angle + other.angle); }
        public Minus(other: Angle): Angle { return new Angle(this.angle - other.angle); }
        public Mult(s: number): Angle {return new Angle(this.angle * s);}
        public Div(s: number): Angle {return new Angle(this.angle / s);}
        public Diff(other: Angle): number {
            const diff = new Angle(other.angle - this.angle);
            return diff.angle-180;
        }
    }

    export function Update(): void {
        UpdateSpeed();
        UpdateYaw();
        $.Schedule(0, Update);
    }
}
YawSettings.Update();