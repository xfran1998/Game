const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class GMath {
    static NormalizeVector(vec){
        let mod = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
        let mov = [0, 0];
        if (mod != 0){
            mov = [vec[0]/mod, vec[1]/mod];
        }

        return mov;
    }
}

class Pawn{
    constructor(size, pos, color, speed){
        this.size = size;
        this.pos = pos;
        this.color = color;
        this.speed = speed;
    }

    Update(tarjetPos){
        this.pos = [this.pos[0]+tarjetPos[0]*this.speed, this.pos[1]+tarjetPos[1]*this.speed];
        // console.log(tarjetPos);
    }  

    UpdateValid(tarjetPos, center){
        let newPos = [this.pos[0]+tarjetPos[0]*this.speed, this.pos[1]+tarjetPos[1]*this.speed];
        
        // Check inside cambas x axis
        if (center[0]*2-this.size < newPos[0]) this.pos[0] = center[0]*2-this.size;
        else if(newPos[0] < this.size) this.pos[0] = this.size;
        else this.pos[0] = newPos[0];

        // Check inside cambas y axis
        if (center[1]*2-this.size < newPos[1]) this.pos[1] = center[1]*2-this.size;
        else if(newPos[1] < this.size) this.pos[1] = this.size;
        else this.pos[1] = newPos[1];
        // console.log(tarjetPos);
    }  
}

class Projectile extends Pawn{
    constructor(size, pos, color, speed, targetPos, centerCanvas, enemy){
        super(size, pos, color, speed);
        this.enemy = enemy;

        // Getting vector towards player normalized
        let vec = [targetPos[0] - pos[0], targetPos[1] - pos[1]]
        this.mov = GMath.NormalizeVector(vec);

        this.centerCanvas = centerCanvas;
        this.distDespawn = Math.sqrt(centerCanvas[0]*centerCanvas[0] + centerCanvas[1]*centerCanvas[1]) + 5*size;
    }

    Update(){
        super.Update(this.mov);
    }

    CheckDestroyed(){
        // The circule of despawn is iqual to: Lenght of square to center of canvas (hypotenuse)
        // + 5 times the size of the of the projectal (so don't insta despawn when created outside)
        // All of this is calculated by the center of the projectiles not the border, so the center
        // of the projectiles have to pass the limit
        
        // Getting dist to center of canvas = hypotenuse
        let dist = [this.centerCanvas[0]-this.pos[0],this.centerCanvas[1]-this.pos[1]];
        dist = Math.sqrt(dist[0]*dist[0] + dist[1]*dist[1]);
        
        let destroy = false;
        if (dist > this.distDespawn){
            destroy = true;
        }

        return destroy;
    }
}

class Player extends Pawn{
    constructor(size, pos, color, speed, name, health){
        super(size, pos, color, speed);
        this.name = name;
        this.health = health;
    }

    // Move toward espefic target, this a
    Move(dir, center){
        dir = GMath.NormalizeVector(dir);
    
        super.UpdateValid(dir, center);
        // console.log((center[0]*2-this.size) > this.pos[0] && this.pos[0] > (0+this.size));
    }

    GetPos(){
        return this.pos;
    }
}

class GameState{
    constructor(){
        this.players = new Array();
        this.projectiles = new Array();
        this.spawnProjectiles = false;
    }

    AddPlayer(player){
        this.players.push(player);
    }

    AddProjectiles(proj){
        this.projectiles.push(proj);
    }
}

class Display{
    static Draw(myGameState, context){
        Display.ClearScreen(context);

        myGameState.projectiles.forEach(proj => {
            Display.DrawPawn(proj, context);
        });
        
        myGameState.players.forEach(player => {
            Display.DrawPawn(player, context);
        });

        let player = myGame.myGameState.players[0];
        Display.DrawHealthBar(player, context);
    }

    static DrawPawn(pawn, context){
        context.beginPath();
        context.arc(pawn.pos[0], pawn.pos[1], pawn.size, 0, Math.PI*2, false);  
        context.fillStyle = pawn.color;           
        context.fill(); 
    }

    static ClearScreen(context){
        const tam = canvas.getBoundingClientRect();
        context.clearRect(0, 0, tam.width, tam.height);
    }

    static DrawHealthBar(player, context){
        // Border
        let pos = [20,20];
        let tamBorder = [200, 30];
        let tamHealth = [player.health, 30];
        let stroke = 3;

        // Player green health
        context.beginPath();
        context.rect(pos[0], pos[1], tamHealth[0], tamHealth[1]);
        context.fillStyle = "green";           
        context.fill(); 
        
        // Border of the player health
        context.beginPath();
        context.rect(pos[0], pos[1], tamBorder[0], tamBorder[1]);
        context.lineWidth = stroke;
        context.strokeStyle = 'black';
        context.stroke();        
    }
}

class Game{
    constructor(context){
        this.myGameState = new GameState();
        this.context = context;
        let tam = canvas.getBoundingClientRect();
        this.center = [tam.width/2, tam.height/2];
    }

    Run(){
        requestAnimationFrame(() => this.Run());
        this.myGameState.projectiles.forEach(proj => {
            proj.Update();
        });
        Display.Draw(this.myGameState, this.context);
    }

    PlayerMove(direction){
        this.myGameState.players[0].Move(direction, this.center);
    }

    PlayerDmg(player, dmg){
        player.health -= dmg;

        if (player.health < 0){
            player.health = 0;
        }
    }

    SpawnPlayer(size, pos, color, speed, name, health){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 50;
        // const pos = [x, y];
        // const color = 'blue';
        // const speed = 1;
        // const name = "Player01";
    
        const newPlayer = new Player(size, pos, color, speed, name, health);
        this.myGameState.AddPlayer(newPlayer);
    }
    
    SpawnProjectile(size, pos, color, speed, posTarjet, owner){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 30;
        // const pos = [innerWidth-size, innerHeight-size];
        // const color = 'red';
        // const speed = 1;
        // const tarjetPos = [x,y];
        // +size/2

        let enemyPlayer = owner == this.myGameState.players[0] ? this.myGameState.players[1] : this.myGameState.players[0];
        const newProj = new Projectile(size, pos, color, speed, posTarjet, this.center, enemyPlayer);
        this.myGameState.AddProjectiles(newProj);
    }
    
    SpawnIncomingProjectiles(numProj, maxSize, minSize, color, posTarget, owner){
        
        const radius = Math.sqrt(this.center[0]*this.center[0]+this.center[1]*this.center[1]) + maxSize;
        
        for (let i=0; i < numProj; i++){
            const randSize = Math.random() * (maxSize - minSize) + minSize;
            const randAngPos = Math.random() * (Math.PI*2);
            const x = this.center[0] + radius * Math.cos(randAngPos);
            const y = this.center[1] + radius * Math.sin(randAngPos);

            
            this.SpawnProjectile(randSize, [x,y], color, 5, posTarget, owner);
        }
    }
    
    DespawnProjectile(){
        for (let i=0; i < this.myGameState.projectiles.length; i++){
            if (this.myGameState.projectiles[i].CheckDestroyed()){
                this.myGameState.projectiles.splice(i,1);
            }
        }
    }

    ProjectileHitEnemy(){
        for (let i=0; i < this.myGameState.projectiles.length; i++){
            let vec = [this.myGameState.projectiles[i].enemy.pos[0] - this.myGameState.projectiles[i].pos[0], this.myGameState.projectiles[i].enemy.pos[1] - this.myGameState.projectiles[i].pos[1]];
            // console.log(this.myGameState.projectiles[i].pos);
            let dist = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
            let sizeCombined = this.myGameState.projectiles[i].size + this.myGameState.projectiles[i].enemy.size;

            // console.log("dist: ", dist);
            // console.log("comb: ", sizeCombined);

            if (dist < (sizeCombined) ){ // If projectile inside enemy
                this.PlayerDmg(this.myGameState.projectiles[i].enemy, this.myGameState.projectiles[i].size) 
                console.log("Hit!!");
            }
        }
    }
}

// defaultPlayer();
// defaultProjectile();
let myGame = new Game(context);
myGame.SpawnPlayer(50, [innerWidth/2,innerHeight/2], 'blue', 10, 'Player1', 200);
myGame.SpawnPlayer(50, [innerWidth-80,innerHeight/2], 'red', 10, 'Player2', 200);
myGame.Run();


// Move keybinding this to his own class in the future

// Click - Spawn projectile to mouse pos
addEventListener('click', (e) => {
    let player = myGame.myGameState.players[0];
    let posPlayer = player.GetPos();
    myGame.SpawnProjectile(15, posPlayer, 'blue', 10, [e.x,e.y], myGame.myGameState.players[0]);
});

// Q key - Spawn multiple projectiles to player pos
document.addEventListener('keypress', (e) => {
    if (e.key == 'q' || e.key == 'Q'){
        // simulating Player 2 pressed Q
        let player = myGame.myGameState.players[1];
        let enemyPlayer = player == myGame.myGameState.players[0] ? myGame.myGameState.players[1] : myGame.myGameState.players[0];
        let enemyPos = enemyPlayer.GetPos();
        let color = player.color;
        myGame.SpawnIncomingProjectiles(5, 30, 15,color, enemyPos, player);
    }
});

let dir = [0,0];

// Player Movement 
document.addEventListener('keydown', (e) => {
    // W - UP
    if (e.key == 'w' || e.key == 'W'){
        dir[1] = -1;

    } // S - DOWN
    else if (e.key == 's' || e.key == 'S'){
        dir[1] = 1;
        
    } // A - LEFT
    else if (e.key == 'a' || e.key == 'A'){
        dir[0] = -1;
        
    } // D - RIGHT
    else if (e.key == 'd' || e.key == 'D'){
        dir[0] = 1;
    }
});

document.addEventListener('keyup', (e) => {
    // W - UP
    if (e.key == 'w' || e.key == 'W'){
        if (dir[1] == -1){
            dir[1] = 0;   
        }

    } // S - DOWN
    else if (e.key == 's' || e.key == 'S'){
        if (dir[1] == 1){
            dir[1] = 0;   
        }
        
    } // A - LEFT
    else if (e.key == 'a' || e.key == 'A'){
        if (dir[0] == -1){
            dir[0] = 0;   
        }
        
    } // D - RIGHT
    else if (e.key == 'd' || e.key == 'D'){
        if (dir[0] == 1){
            dir[0] = 0;   
        }
    }
});


setInterval(() => {
    myGame.DespawnProjectile();
    myGame.ProjectileHitEnemy();
}, 100);

setInterval(() => {
    myGame.PlayerMove(dir);
}, 10);


// Player can move on his field but never go throw
