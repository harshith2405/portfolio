
#include <bits/stdc++.h>
using namespace std;
void parser2(string f){
    bool minus=false;
    for(char c:f) 
        if(c=='-'){
            minus=true;
            break;
        }
    if(minus){
        int i=0,start=0,end=0;
        while(f[i]!='-'){ start=start*10+(f[i]-'0'); i++;}
        i++;
        while(i<f.size()){ end=end*10+(f[i]-'0'); i++;}
        for(int i=start; i<=end;i++)
            cout<<i<<" ";
        return;
    }
    else 
    cout<<stoi(f)<<" ";
}
void parser(string &f,int s, int e){
    if(f=="*"){
        for(int i=s;i<=e;i++)
            cout<<i<<" ";
        return;
    }
    if(f.substr(0,2)=="*/"){
        int x=stoi(f.substr(2));
        for(int i=s;i<=e;i+=x)
            cout<<i<<" ";
        return;
    }
    bool coma=false;
    for(char c:f){
        if(c==',') {coma=true; break;}
    }
    if(coma){
        int num=0;
        string value="";
        for(int i=0;i<=f.size();i++){
            if(i==f.size() || f[i]==','){
                parser2(value);
                value="";
            }
            else 
                value+=f[i];
        }
        return;
    }
    parser2(f);
    
    
}
int main() {
    // Write C++ code here
        string s;
        getline(cin,s);
        stringstream ss(s);
     vector<string>vec;
        string temp;
        while (ss >> temp)
            vec.push_back(temp);
       vector<pair<int,int>>range={{0,59},{0,23},{1,31},{1,12},{0,6}};
       vector<string>names{"minute","hour","day of month","month","day of week"};
      for(int i=0;i<5;i++){
        cout<<names[i];
        int x=14-names[i].size();
        while(x--) cout<<" ";
        parser(vec[i],range[i].first,range[i].second);
        cout << endl;
    }

    cout << "command       " << vec[5] << endl;
    return 0;
}