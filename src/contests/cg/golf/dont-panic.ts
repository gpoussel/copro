var S=()=>readline().split(" "),i=S(),E=[],n=+i[7],a
for(;n--;)a=S(),E[a[0]]=a[1]
for(E[i[3]]=i[4];;)a=S(),console.log((+a[1]-E[a[0]])*(a[2]<"R"?-1:1)>0?"BLOCK":"WAIT")