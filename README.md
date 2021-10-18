# Test Game

### Projectile behaviour
* 1: Projectile from player to mouse pointer when player click (posible couldown)
* 2: Projectiles that go to player last position

#### 1 - To player click
* Origin: Player ( [P1,P2] )
* Tarjet: Mouse Pos ( [M1,M2] )

```javascript
// Vector Direction = Mouse Pos - Player
dir = [M1-P1, M2-P2]
pos = [P1, P2]
```

#### 2 - To mouse click position
* Origin: Away canvas, but  ( [P1,P2] )
* Tarjet: Mouse Pos ( [M1,M2] )

```javascript
// Vector Direction = Mouse Pos - Player
dir = [M1-P1, M2-P2]
pos = [P1, P2]
```