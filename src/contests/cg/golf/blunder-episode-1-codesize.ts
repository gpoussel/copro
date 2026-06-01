var[L,C]=readline().split(" ").map(Number),g=[],r,c,i,j,l,p,x,k,ch,m,a,b,Y=[1,0,-1,0],X=[0,1,0,-1],N=["SOUTH","EAST","NORTH","WEST"],dir=0,br=0,inv=0,O="",S=new Set,blk=d=>(x=g[r+Y[d]][c+X[d]])=="#"||x=="X"&&!br
for(i=0;i<L;i++){l=readline();~(j=l.search("@"))&&(r=i,c=j);g.push([...l])}
for(;;){
k=[r,c,dir,br,inv]+""
if(S.has(k)){O="LOOP";break}
S.add(k)
if(blk(dir))for(p of inv?[3,2,1,0]:[0,1,2,3])if(!blk(p)){dir=p;break}
O+=N[dir]+"\n"
r+=Y[dir];c+=X[dir]
ch=g[r][c],m="SENW".indexOf(ch)
if(ch=="$")break
~m&&(dir=m)
ch=="I"&&(inv^=1)
ch=="B"&&(br^=1)
ch=="X"&&(g[r][c]=" ",S.clear())
if(ch=="T")for(a=r,b=c,i=0;i<L;i++)for(j=0;j<C;j++)if(g[i][j]=="T"&&(i-a||j-b)){r=i;c=j}
}
console.log(O)
