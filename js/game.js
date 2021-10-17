const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Pawn{
    constructor(size, pos, color, speed){
        this.size = size;
        this.pos = pos;
        this.color = color;
        this.speed = speed;
    }

    Update(tarjetPos){
        this.pos = [this.pos[0]+tarjetPos[0], this.pos[1]+tarjetPos[1]];
        // console.log(this.pos);
    }    
}

class Projectile extends Pawn{
    constructor(size, pos, color, speed, targetPos){
        super(size, pos, color, speed);

        // Getting vector towards player normalized
        let vec = [targetPos[0] - pos[0], targetPos[1] - pos[1]];
        let mod = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
        this.speed = [vec[0]*speed/mod, vec[1]*speed/mod] // Applying speed also
    }

    Update(){
        super.Update(this.speed);
    }
}

class Player extends Pawn{
    constructor(size, pos, color, speed, name){
        super(size, pos, color, speed);
        this.name = name;
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
    }

    Run(){
        requestAnimationFrame(() => this.Run());
        this.myGameState.projectiles.forEach(proj => {
            proj.Update();
        });
        Display.Draw(this.myGameState, this.context);
    }

    spawnPlayer(size, pos, color, speed, name){
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
    
    spawnProjectile(size, pos, color, speed, posTarjet){
        // const x = innerWidth / 2;
        // const y = innerHeight / 2;
        // const size = 30;
        // const pos = [innerWidth-size, innerHeight-size];
        // const color = 'red';
        // const speed = 1;
        // const tarjetPos = [x,y];
        // +size/2
        const newProj = new Projectile(size, pos, color, speed, posTarjet);
        this.myGameState.AddProjectiles(newProj);
    }
    
    spawnIncomingProjectiles(numProj, maxSize, minSize, posTarget){
        const tam = canvas.getBoundingClientRect();
        const center = [tam.width/2, tam.height/2];
        const radius = Math.sqrt(center[0]*center[0]+center[1]*center[1]) + maxSize;
        console.log(radius);
        
        for (let i=0; i < numProj; i++){
            const randSize = Math.random() * (maxSize - minSize) + minSize;
            const randAngPos = Math.random() * (Math.PI*2);
            const x = center[0] + radius * Math.cos(randAngPos);
            const y = center[1] + radius * Math.sin(randAngPos);
            this.spawnProjectile(randSize, [x,y], 'red', 5, posTarget);
            console.log([x,y]);
        }
    }
}

// defaultPlayer();
// defaultProjectile();
let myGame = new Game(context);
myGame.spawnPlayer(50, [innerWidth/2,innerHeight/2], 'blue', 0, '');
myGame.Run();


// Move this to his own class in the future
addEventListener('click', (e) => {
    myGame.spawnProjectile(20, [e.x,e.y], 'red', 3, [innerWidth/2,innerHeight/2]);
});

document.addEventListener('keypress', (e) => {
    if (e.key == 'q'){
        myGame.spawnIncomingProjectiles(10, 30, 15, [innerWidth/2,innerHeight/2]);
    }

});