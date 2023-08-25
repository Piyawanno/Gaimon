# การติดตั้ง ระบบ Gaimon
เมื่อทำการลงระบบ Linux เสร็จสิ้นให้รันคำสั่ง

```
    sudo apt-get install python3 python3-pip postgresql redis-server vim wkhtmltopdf
```
ให้ทำการรัน start service ของ redis กับ postgresql 

```
    sudo service postgresql restart
    sudo service redis-server restart
```

เข้า database postgresql โดยใช้คำสั่ง 
```
    sudo -u postgres psql 
```

สร้าง database user และ สิทธ์ทั้งหมด

```
    CREATE DATABASE gaimon;
    CREATE USER gaimon WITH PASSWORD 'password';
    GRANT ALL PRIVILEGES ON DATABASE gaimon to gaimon;
```

ไปที่ folder Xerial รั้นทำสั่ง
```
    sudo python3 setup.py setup
    sudo python3 setup.py link
```

ไปที่ folder Gaimon รัน
```
    sudo python3 setup.py setup
    sudo python3 setup.py link
```

(สำหรับนักพัฒนา) ไปที่ path /etc/gaimon จากนั้น รัน
```
    cd /etc/gaimon/
    sudo vim Gaimon.json
```

ในไฟล์ Gaimon.json มีรายละเอียดดังนี้
```
    {
        "host" : "localhost",       # address host
        "port" : 8080,              # พอท ของระบบ 
        "rootURL" : "http://localhost:8080/",  # ตั้งต่า url
        "resourcePath" : "/var/gaimon/",
        "home": "/backend",     
        "theme" : null,
        "country" : "th",
        "extension" : [
            # สำหรับใส่ extension เช่น
            "gaimonerp.erpbase",
            "gaimonerp.machine"
        ],
        "logLevel.option" : {
            "DEBUG" : 10,
            "INFO" : 20,
            "WARNING" : 30
            "ERROR" : 40
        },
        "logLevel" : 20,
        "sleepTime" : 30,
        "isDevelop" : 0,    # สำหรับนั้กพํฒนา เปลี่ยนเป็น 1
        "title" : "TITLE"
    }
```

ไปที่ Gaimon/gaimon/util รัน
```
    python3 UserCreator.py
```

รัน คำสั่งเพื่อ รันระบบ Gaimon
```
    sudo gaimon
```