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
        console.log(tarjetPos);
    }  
}

class Projectile extends Pawn{
    constructor(size, pos, color, speed, targetPos, centerCanvas){
        super(size, pos, color, speed);

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
    constructor(size, pos, color, speed, name){
        super(size, pos, color, speed);
        this.name = name;
    }

    // Move toward espefic target, this a
    Move(dir){
        dir = GMath.NormalizeVector(dir);
        super.Update(dir);
        //console.log(dir);
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
        this.myGameState.players[0].Move(direction);
    }

    SpawnPlayer(size, pos, color, speed, name){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 50;
        // const pos = [x, y];
        // const color = 'blue';
        // const speed = 1;
        // const name = "Player01";
    
        const newPlayer = new Player(size, pos, color, speed, name);
        this.myGameState.AddPlayer(newPlayer);
    }
    
    SpawnProjectile(size, pos, color, speed, posTarjet){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 30;
        // const pos = [innerWidth-size, innerHeight-size];
        // const color = 'red';
        // const speed = 1;
        // const tarjetPos = [x,y];
        // +size/2
        const newProj = new Projectile(size, pos, color, speed, posTarjet, this.center);
        this.myGameState.AddProjectiles(newProj);
    }
    
    SpawnIncomingProjectiles(numProj, maxSize, minSize, posTarget){
        
        const radius = Math.sqrt(this.center[0]*this.center[0]+this.center[1]*this.center[1]) + maxSize;
        
        for (let i=0; i < numProj; i++){
            const randSize = Math.random() * (maxSize - minSize) + minSize;
            const randAngPos = Math.random() * (Math.PI*2);
            const x = this.center[0] + radius * Math.cos(randAngPos);
            const y = this.center[1] + radius * Math.sin(randAngPos);
            this.SpawnProjectile(randSize, [x,y], 'red', 5, posTarget);
        }
    }
    
    DespawnProjectile(){
        for (let i=0; i < this.myGameState.projectiles.length; i++){
            if (this.myGameState.projectiles[i].CheckDestroyed()){
                this.myGameState.projectiles.splice(i,1);
            }
        }
    }
}

// defaultPlayer();
// defaultProjectile();
let myGame = new Game(context);
myGame.SpawnPlayer(50, [innerWidth/2,innerHeight/2], 'blue', 10, '');
myGame.Run();


// Move keybinding this to his own class in the future

// Click - Spawn projectile to mouse pos
addEventListener('click', (e) => {
    myGame.SpawnProjectile(15, [innerWidth/2,innerHeight/2], 'red', 10, [e.x,e.y]);
});

// Q key - Spawn multiple projectiles to player pos
document.addEventListener('keypress', (e) => {
    if (e.key == 'q' || e.key == 'Q'){
        myGame.SpawnIncomingProjectiles(5, 30, 15, [innerWidth/2,innerHeight/2]);
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
}, 100);

setInterval(() => {
    myGame.PlayerMove(dir);
}, 10);


// Player can move on his field but never go throw
