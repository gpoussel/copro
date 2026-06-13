var R=readline,[W,H]=R().split(" ").map(Number),S=W+1,G=[],L=console.log,Y=(p,i,k=0,n=0)=>([1,-1,S,-S].map(d=>{for(var j=i,r=3;r--&&p[j+=d]!="#";)p[j]>"."&&(n++,k&&(p[j]="."))}),n),T=p=>p.filter(c=>c>".").length,F=(p,i,B,q=[...p])=>(Y(q,i,1),Math.max(...q.map((c,e)=>c=="."?Y(q,e):0))*B>=T(q)),Z={},i,U,V,bo,md,bi,x,y,d
for(i=H;i--;)G.push(...R(),"#")
U=[...G]
for(;V=R();){bo=+V.split(" ")[1]
for(i in Z)--Z[i]==0&&(Y(G,+i,1),delete Z[i])
md=0
for(x=0;x<W;x++)for(y=0;y<H;y++)U[i=y*S+x]=="."&&(d=Y(U,i))>md&&F(U,i,bo-1)&&(md=d,bi=i)
md&&G[bi]=="."&&!Z[bi]?(Y(U,bi,1),Z[bi]=3,L(bi%S+" "+(bi/S|0))):L("WAIT")}