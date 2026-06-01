var dr=[-1,1,0,0],dc=[0,0,-1,1],nm=["UP","DOWN","LEFT","RIGHT"],Z=()=>readline().split(" ").map(Number),S,W
function bfs(s){var d=[],f=[],q=[s],k=0;d[s]=0;for(;k<q.length;k++){var u=q[k],y=u/C|0,x=u%C;if(S[u]=="?")continue;for(var t=0;t<4;t++){var Y=y+dr[t],X=x+dc[t];if(Y<0||X<0||Y>=R||X>=C)continue;var id=Y*C+X;if(S[id]=="#"||S[id]==W||d[id]>=0)continue;d[id]=d[u]+1;f[id]=u==s?nm[t]:f[u];q.push(id)}}return[d,f]}
var[R,C,A]=Z(),B=0
for(;;){
var[r,c]=Z(),i
for(S="",i=0;i<R;i++)S+=readline()
var T=S.indexOf("T"),E=S.indexOf("C"),P=r*C+c
if(P==E)B=1
var Q=E>=0&&bfs(E)[0][T]<=A
W=B||Q?"":"C"
var[d,f]=bfs(P),G=T
if(!B)if(Q)G=E;else{var b=1/0;for(i=0;i<R*C;i++)if(S[i]=="?"&&d[i]<b){b=d[i];G=i}}
console.log(f[G])
}
