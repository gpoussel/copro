eval(`for(R=readline,M=R(),V=R(),G=[R(),R(),R(),R()],L=G[0].length,A="SPEED SLOW JUMP UP DOWN WAIT".split(" ");;){
for(S=+R(),Y=[],i=M;i--;)p=R().split(" "),+p[2]&&(X=+p[0],Y.push(+p[1]))
q=[[S,X,Y,""]],m={},o="WAIT"
for([s,x,Z,f]of q){
if(x>=L){o=f||"SPEED";break}
for(j=6;j--;){
ns=s+(j<2?1-2*j:0)
if(ns<0)continue
W=[],e=x+ns
for(y of Z){
n=(n=y+(j==3?-1:j==4?1:0))<0||n>3?y:n;b=0
if(j==2)b=G[y][e]=="0"
else for(c=x;c++<e;)b||=G[n][c]=="0"||c<e&&G[y][c]=="0"
b||W.push(n)}
if(W.length<V||m[k=[e,ns,W.sort()]+''])continue
m[k]=q.push([ns,e,W,f||A[j]])}}
print(o)}`)