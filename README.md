# Dota Third Person Camera
A third person camera for dota 2 custom games.

## Settings
> The `third_person_camera.xml` can be used to play around with different settings.

### Position

|          Setting           |                                                        Description                                                        | Recommended  |
|:--------------------------:|:-------------------------------------------------------------------------------------------------------------------------:|:------------:|
|        *max_speed*         |                                                    The maximum speed.                                                     |   0-10000    |
|   *speed_curve_exponent*   |                                                Determines the speed curve.                                                |     0-1      |
|     *slow_down_radius*     |                                    Radius in which the speed slows down exponentially.                                    |    0-1000    |
|    *influence_of_mouse*    |                                 Determines how the mouse influences the target position.                                  |     0-1      |
|  *free_cam_middle_mouse*   |                               Whether the camera can be moved freely with the middle mouse.                               |              |
|     *free_cam_minimap*     |                                 Whether the camera can be moved freely with the minimap.                                  |              |
| *free_cam_buffer_duration* |                                 How long the camera doesn't move after using the free cam                                 |     0-1      |
|       *max_distance*       |                                              The maximum distance possible.                                               | based on map |
|   *only_units_on_screen*   | Whether the target position only considers units on screen.<br/>(Uses off-screen units if no selected unit is on screen.) |    *true*    |

## Yaw
|        Setting         |                                                        Description                                                        | Recommended |
|:----------------------:|:-------------------------------------------------------------------------------------------------------------------------:|:-----------:|
|      *max_speed*       |                                                    The maximum speed.                                                     |    0-180    |
| *speed_curve_exponent* |                                                Determines the speed curve.                                                |    0-10     |
|   *slow_down_angle*    |                                    Angle in which the speed flows down exponentially.                                     |    0-90     |
| *only_units_on_screen* | Whether the target position only considers units on screen.<br/>(Uses off-screen units if no selected unit is on screen.) |   *true*    |
|      *max_angle*       |                                                The maximum angle possible.                                                |     180     |
