from typing import Union , List
from fastapi import FastAPI , Form , Request , UploadFile , File
from fastapi.responses import FileResponse , StreamingResponse
from mysql.connector import connect, Error
import json
from fastapi.middleware.cors import CORSMiddleware
import io
import pandas
import requests
# date
from datetime import datetime, timedelta

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"]
)

# fix blocked:mixed-content ในการเรียกใช้งานไฟล์รูปภาพ
@app.get("/image/{image_name}")
def image(image_name: str):
    
    return FileResponse(f"image/{image_name}")
    

# Connect to MySQL
def connect_to_mysql():
    try:
        connection = connect(
            host="database",
            user="root",
            password="root",
            database="lpr",
        )
        return connection
    except Error as e:
        print(e)

@app.get("/line_list")
def line_list():
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)  # Set dictionary=True to fetch results as dictionaries
    cursor.execute("SELECT * FROM line")
    result = cursor.fetchall()
    cursor.close()
    connection.close()

    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result

@app.get("/line/{line_id}")
def line(line_id: int):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM line WHERE id = {line_id}")
    result = cursor.fetchone()
    cursor.close()
    connection.close()

    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result

@app.get("/list")
def list():
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT l.id , fullname , license_plate , type_list_id , type_name , l.created_at FROM list as l , type_list as tl WHERE l.type_list_id = tl.id")
    result = cursor.fetchall()
    cursor.close()
    connection.close()

    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result
    

@app.post("/list/search")
def list(list_id: str = Form(...)):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    # ค้นหาป้ายทะเบียน จาก history ใยระยะเวลาไม่เกิน 3 นาที
    cursor.execute(f"SELECT * FROM history WHERE lpr = '{list_id}' AND datetime >= NOW() - INTERVAL 3 MINUTE")
    result = cursor.fetchone()
    #if result is not None:
    cursor.execute(f"SELECT l.* , type_name , line_send , open_gate , l.created_at FROM list as l , type_list as tl WHERE l.type_list_id = tl.id AND license_plate = '{list_id}'")
    result = cursor.fetchone()
    #else:
        # เปลี่ยน sendline ให้เป็น 0 โดยไม่อัพเดทที่ฐานข้อมูล
        #cursor.execute(f"SELECT l.* , type_name , 0 as line_send , open_gate , l.created_at FROM list as l , type_list as tl WHERE l.type_list_id = tl.id AND license_plate = '{list_id}'")
        #result = cursor.fetchone()

    cursor.close()
    connection.close()

    if result is None:
        return []
    else :
        # Convert to JSON
        result = json.loads(json.dumps(result, default=str))
    return result

@app.post("/list/type_list")
def list(type_list_id: List[int]):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    
    # สร้างสตริงของพารามิเตอร์ที่จะถูกแทนที่ในคำสั่ง SQL
    placeholders = ', '.join(['%s'] * len(type_list_id))
    
    # สร้างคำสั่ง SQL ด้วย placeholders
    query = f"SELECT l.id , fullname , license_plate , type_list_id , type_name , l.created_at FROM list as l , type_list as tl WHERE l.type_list_id = tl.id AND type_list_id IN ({placeholders})"
    
    # execute query และใส่ค่าพารามิเตอร์เข้าไป
    cursor.execute(query, tuple(type_list_id))
    result = cursor.fetchall()
    cursor.close()
    connection.close()

    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result

@app.post("/list/add")
def list_add(fullname: str = Form(...), lpr: str = Form(...), type_list_id: int = Form(...)):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"INSERT INTO `list` (`id`, `fullname`, `license_plate`, `type_list_id`, `created_at`, `updated_at`) VALUES (NULL, '{fullname}', '{lpr}', {type_list_id}, current_timestamp(), current_timestamp())")
    connection.commit()
    cursor.close()
    connection.close()

    return {"status": "success"}

@app.post("/list/update")
def list_update(id: int = Form(...), fullname: str = Form(...), lpr: str = Form(...), type_list_id: int = Form(...)):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"UPDATE `list` SET `fullname` = '{fullname}', `license_plate` = '{lpr}', `type_list_id` = {type_list_id}, `updated_at` = current_timestamp() WHERE `list`.`id` = {id}")
    connection.commit()
    cursor.close()
    connection.close()

    return {"status": "success"}

@app.post("/list/delete")
def list_delete(id: int = Form(...)):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"DELETE FROM `list` WHERE `list`.`id` = {id}")
    connection.commit()
    cursor.close()
    connection.close()

    return {"status": "success"}

@app.post("/list/delete/lpr")
def list_delete(lpr: str  = Form(...)):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    #print(f"DELETE FROM `list` WHERE `license_plate` = {lpr}")
    cursor.execute(f"DELETE FROM `list` WHERE `license_plate` = '{lpr}'")
    connection.commit()
    cursor.close()
    connection.close()

    return {"status": "success"}

@app.post("/list/upload")
def list_upload(
    file: UploadFile = File(...)
):
    excel_data_df = pandas.read_excel(io.BytesIO(file.file.read()), sheet_name='Sheet1')
    json_str = excel_data_df.to_json(orient='records')
    data = json.loads(json_str)
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    for i in data:
        # search 
        cursor.execute(f"SELECT * FROM list WHERE license_plate = '{i['lpr']}'")
        result = cursor.fetchone()
        if result is None:
            cursor.execute(f"INSERT INTO `list` (`id`, `fullname`, `note` , `license_plate`, `type_list_id`, `created_at`, `updated_at`) VALUES (NULL, '{i['name']}' , '{i['note']}', '{i['lpr']}', {i['status']}, current_timestamp(), current_timestamp())")
            connection.commit()
    cursor.close()
    connection.close()

    return {"status": "success"}

@app.get("/type_list")
def type_list():
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM type_list")
    result = cursor.fetchall()
    cursor.close()
    connection.close()

    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result

@app.get("/type_list/{type_list_id}")
def type_list(type_list_id: int):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM type_list WHERE id = {type_list_id}")
    result = cursor.fetchone()
    cursor.close()
    connection.close()

    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result

@app.post("/history/all")
def history_all(
    datestart: str = Form(...),
    dateend: str = Form(...),
    types: str = Form(...),
    gates: str = Form(...),
    starttime: str = Form(...),
    endtime: str = Form(...)
):
    try:
        connection = connect_to_mysql()
        cursor = connection.cursor(dictionary=True)
        query = (f"SELECT h.* , g.gate_name ,g.short , tl.type_name "
                 f"FROM history as h "
                 f"JOIN gate as g ON h.gate = g.gate_id "
                 f"JOIN type_list as tl ON h.types = tl.id "
                 f"WHERE h.gate IN ({gates}) AND h.types IN ({types}) "
                 f"AND datetime BETWEEN '{datestart} {starttime}' AND '{dateend} {endtime}' "
                 f"ORDER BY h_id DESC")
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        
        # Convert to JSON
        result = json.loads(json.dumps(result, default=str))
        return result
    except Error as e:
        print(e)
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/history/add2")
def history_add(
    lpr: str = Form(...),
    gate: int = Form(...),
    image: UploadFile = File(...),
):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(f"SELECT * FROM history WHERE lpr = '{lpr}' AND datetime >= NOW() - INTERVAL 3 MINUTE")
    #cursor.execute(f"SELECT * FROM history WHERE lpr = '{lpr}' AND datetime >= NOW()")
    result = cursor.fetchone()
    if result is not None:
        return {"status": "success"}
        
    else:
        with open(f"image/{image.filename}", "wb") as buffer:
            buffer.write(image.file.read())
        
        # ค้นหาป้ายทะเบียนจาก list column type_list_id 
        cursor.execute(f"SELECT type_list_id FROM list WHERE license_plate LIKE '%{lpr}%'")
        res_type = cursor.fetchone()
        res_type_id = res_type['type_list_id']
        if res_type_id is not None:
            list_id = res_type_id
        else:
            list_id = 4

        cursor.execute(f"INSERT INTO `history` (`h_id`, `lpr`, `types` , `gate` , `image`) VALUES (NULL, '{lpr}', '{list_id}','{gate}', '{image.filename}')")
        
        # ค้นหาป้ายทะเบียน โดย join กับ list และ type_list
        cursor.execute(f"SELECT l.* , type_name , l.created_at , tl.line_send FROM list as l , type_list as tl WHERE l.type_list_id = tl.id AND license_plate = '{lpr}'")
        result_1 = cursor.fetchone()
        
        if result_1 is not None:
            # หากเป็นป้ายทะเบียนที่มีอยู่ในระบบ แล้วสถานะ send_line เป็น 1 ให้ส่งข้อมูลไปยัง line
            if result_1['line_send'] == 1:
                cursor.execute(f"SELECT * FROM line");
                line = cursor.fetchone()
                # เลือกแถวที่ 1 แล้วนำ token ไปใส่ใน line_notify
                token = line['line_token']

                # กำหนดเวา
                now = datetime.datetime.now()
                this_time = now.strftime("%Y-%m-%d %H:%M:%S")
                # กำหนด message ที่จะส่งไปยัง line
                message = "\nประเภท " + result_1['type_name'];
                message += "\nหมายเลขทะเบียน " + result_1['license_plate'];
                message += "\nเวลา " + str(this_time);
                
                # ค้นหา gate จาก gate_id
                cursor.execute(f"SELECT * FROM gate WHERE gate_id = {gate}");
                result = cursor.fetchone()
                # ประเภทาเป็น I = เข้าพื้นที่ หากเป็น U = ออกจากที่จอด
                if result['short'] == "I":
                    message += "\nเข้าพื้นที่";
                else:
                    message += "\nออกจากพื้นที่";

                #line_notify_image(token, message, f"image/{image.filename}")
                line_notify(token, message, image.filename)
        
                # send api to http://das-stg.metthier.com:8800/das-api/sdt-carpark-log-lpr 
                # ส่งข้อมูลไปยัง API ที่กำหนด
        now = datetime.now()
        this_time = now.strftime("%Y-%m-%d %H:%M:%S")
        url = "http://das-stg.metthier.com:8800/das-api/sdt-carpark-log-lpr"
        payload = {
                    "log_id": "1287c12a-5e28-4034-872c-13796a6fd61d",
                    "lpr": lpr,
                    "barrier_gate": "IN001",
                    "image": "autotrafficcount.com:8010/backend/image/"+image.filename,
                    "log_time": this_time
                }

        response = requests.request("POST", url, json=payload)
        print(response.text)
        connection.commit()
        cursor.close()
        connection.close()
        return {"status": "success"}
    # save imag
    # rename image


@app.post("/history/add")
def test(
    lpr: str = Form(...),
    gate: int = Form(...),
    image: UploadFile = File(...),
):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(f"SELECT * FROM history WHERE lpr = '{lpr}' AND datetime >= NOW() - INTERVAL 2 MINUTE")
    #cursor.execute(f"SELECT * FROM history WHERE lpr = '{lpr}' AND datetime >= NOW()")
    result = cursor.fetchone()
    if result is not None:
        return {"status": "success"}

    else:
        with open(f"image/{image.filename}", "wb") as buffer:
            buffer.write(image.file.read())

        # ค้นหาป้ายทะเบียนจาก list column type_list_id 
        cursor.execute(f"SELECT type_list_id FROM list WHERE license_plate = '{lpr}'")
        res_type = cursor.fetchone()
        #res_type_id = res_type['type_list_id']
        if res_type is not None:
            res_type_id = res_type['type_list_id']
            list_id = res_type_id
        else:
            list_id = 4

        cursor.execute(f"INSERT INTO `history` (`h_id`, `lpr`, `types` , `gate` , `image`) VALUES (NULL, '{lpr}', '{list_id}','{gate}', '{image.filename}')")

        # หากเป็นป้ายทะเบียนที่มีอยู่ในระบบ แล้วสถานะ send_line เป็น 1 ให้ส่งข้อมูลไปยัง line
        cursor.execute(f"SELECT * FROM type_list WHERE id = {list_id}")
        res_type = cursor.fetchone()
        if res_type['line_send'] == 1:
            cursor.execute(f"SELECT * FROM line");
            line = cursor.fetchone()
                # เลือกแถวที่ 1 แล้วนำ token ไปใส่ใน line_notify
            token = line['line_token']
            #token = "ZJr3drh2Wg5R99K1r2TV2wujvCnmA0RJDiO3dDzLB3F"
                # กำหนดเวา
            now = datetime.now()
            this_time = now.strftime("%Y-%m-%d %H:%M:%S")
                #ค้นหา data
            cursor.execute(f"SELECT * FROM type_list WHERE id = {list_id}")
            res_type = cursor.fetchone()
                # กำหนด message ที่จะส่งไปยัง line
            message = "\nประเภท " + res_type['type_name']
            message += "\nหมายเลขทะเบียน " + str(lpr)
            message += "\nเวลา " + str(this_time)

                # ค้นหา gate จาก gate_id
            cursor.execute(f"SELECT * FROM gate WHERE gate_id = {gate}");
            result = cursor.fetchone()
                # ประเภทาเป็น I = เข้าพื้นที่ หากเป็น U = ออกจากที่จอด
            if result['short'] == "I":
                message += "\nเข้าพื้นที่";
            else:
                message += "\nออกจากพื้นที่";

                #line_notify_image(token, message, f"image/{image.filename}")
            line_notify(token, message, image.filename)

                # send api to http://das-stg.metthier.com:8800/das-api/sdt-carpark-log-lpr
                # ส่งข้อมูลไปยัง API ที่กำหนด
        now = datetime.now()
        this_time = now.strftime("%Y-%m-%d %H:%M:%S.%f")[:23] + " +0700"
        url = "http://das-stg.metthier.com:8800/das-api/sdt-carpark-log-lpr"
        payload = {
                    "log_id": "1287c12a-5e28-4034-872c-13796a6fd61d",
                    "lpr": lpr,
                    "barrier_gate": "IN001",
                    "image": "autotrafficcount.com:8010/backend/image/"+image.filename,
                    "log_time": this_time
                }

        #response = requests.request("POST", url, json=payload)
        #print(response.text)
        connection.commit()
        cursor.close()
        connection.close()
        print("success")
        return {"status": "success"}

def line_notify(token: str, message: str , image: str):
    url = 'https://notify-api.line.me/api/notify'
    headers = {
        ###'content-type': 'multipart/form-data',
        'Authorization': f'Bearer {token}'
    }
    
    # สร้างรูปแบบสำหรับส่งภาพและข้อความ
    with open(f"image/{image}", 'rb') as f:
        data = {'message': message}
        files = {'imageFile': f}
        
        try:
            response = requests.post(url, headers=headers, data=data, files=files)
            if response.status_code == 200:
                print("Notification sent successfully!")
            else:
                #print(f"Failed to send notification. Status code: {response.status_code}")
                print(json.dumps(response.json(), indent=4))
        except Exception as e:
            print("An error occurred:", e)

@app.get("/gate/all")
def gate_all():
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM gate")
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result



@app.post("/gate/update")
def gate_update(
        gate_id: int = Form(...),
        gate_name: str = Form(...),
        short: str = Form(...),
        gate_ip: str = Form(...),
        LoginName: str = Form(...),
        LoginPassword: str = Form(...),
        port: int = Form(...),
):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"UPDATE `gate` SET `gate_name` = '{gate_name}', `short` = '{short}', `gate_ip` = '{gate_ip}', `LoginName` = '{LoginName}', `LoginPasswordgz` = '{LoginPassword}', `port` = '{port}' WHERE `gate`.`gate_id` = {gate_id}")
    connection.commit()
    cursor.close()
    connection.close()
    return {"status": "success"}



@app.post("/line_update")
def line_update(
        id: int = Form(...),
        line_token: str = Form(...),
):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"UPDATE `line` SET `line_token` = '{line_token}' WHERE `line`.`id` = {id}")
    connection.commit()
    cursor.close()
    connection.close()
    return {"status": "success"}






@app.get("/report/{datestart}/{dateend}")
def report(datestart: str, dateend: str):
    try:
        connection = connect_to_mysql()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(f"SELECT count(*) as count FROM history WHERE gate IN (1,3) AND date(datetime) BETWEEN '{datestart}' AND '{dateend}'")
        in_all = cursor.fetchall()

        cursor.execute(f"SELECT count(*) as count FROM history WHERE gate IN (2,4) AND date(datetime) BETWEEN '{datestart}' AND '{dateend}'")
        out_all = cursor.fetchall()

        # total 
        total = in_all[0]['count'] - out_all[0]['count']

        # ค้นหาตามประเภทโดยใช้่ป้ายทะเบียน แยกตามประเภท 1 2 3 4
        

        return count_all
    except Error as e:
        print(e)


# export ไฟล์ excel
@app.get("/export/lpr_excel")
def export_lpr_excel(
    
):
    try:
        connection = connect_to_mysql()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(f"SELECT fullname , note , license_plate , type_name FROM list as l , type_list as tl WHERE l.type_list_id = tl.id")
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        # Convert to Excel file
        df = pandas.DataFrame(result)
        df.to_csv("lpr.csv", encoding='utf-8-sig' ,index=False)
        return FileResponse("lpr.csv")
    except Error as e:
        print(e)


# export ไฟล์ excel สำหรับทำ report รถขาออก
@app.get("/export/report_excel/{datestart}/{dateend}/{types}/{gates}/{starttime}/{endtime}")
def export_report_excel(datestart: str, dateend: str , types: str , gates: str , starttime: str , endtime: str):
    try:
        connection = connect_to_mysql()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(f"SELECT h.lpr, tl.type_name, DATE_FORMAT(h.datetime, '%Y-%m-%d %H:%i') AS datetime, g.gate_name "
                 f"FROM history AS h "
                 f"JOIN gate AS g ON h.gate = g.gate_id "
                 f"JOIN type_list AS tl ON h.types = tl.id "
                 f"WHERE h.gate IN ({gates}) AND h.types IN ({types}) "
                 f"AND datetime BETWEEN '{datestart} {starttime}' AND '{dateend} {endtime}' "
                 f"ORDER BY h_id DESC")
        result = cursor.fetchall()
        cursor.close()
        connection.close()
    
        # Convert to Excel file
        df = pandas.DataFrame(result)
        # df.to_csv("report.csv",encoding='utf-8-sig', index=False)
        
        # #ตั้งชื่อไฟล์
        # return FileResponse("report.csv")
        output = io.BytesIO()
        df.to_csv(output, encoding='utf-8-sig', index=False)
        output.seek(0)
        
        # Return the CSV file as a StreamingResponse
        return StreamingResponse(output, media_type='text/csv', headers={"Content-Disposition": "attachment; filename=report.csv"})
    except Error as e:
        print(e)



@app.post("/type_edit")
def type_edit(
    id: int = Form(...),
    type_name: str = Form(...),
    line_send: int = Form(...),
    open_gate: int = Form(...),
):
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(f"UPDATE `type_list` SET `type_name` = '{type_name}', `line_send` = '{line_send}' , `open_gate` = '{open_gate}' WHERE `type_list`.`id` = {id}")
    connection.commit()
    cursor.close()
    connection.close()
    return {"status": "success"}

@app.get("/dash")
def dash():
    # ค้นหายอดในวันนี้
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    #ยอดรถรวมทั้งหมดหักยอดรถออก
    cursor.execute(f"SELECT count(*) as count FROM history WHERE gate IN(SELECT gate_id FROM gate WHERE short = 'I')  AND date(datetime) = CURDATE()")
    in_all = cursor.fetchall()

    cursor.execute(f"SELECT count(*) as count FROM history WHERE gate IN(SELECT gate_id FROM gate WHERE short = 'U')  AND date(datetime) = CURDATE()")
    out_all = cursor.fetchall()

    #ยอดรถที่อยู่ในพื้นที่
    on_site = in_all[0]['count'] - out_all[0]['count']

    #ยอดถคงค้างโดยหาจากป้ายทะเบียนที่ไม่มีป้ายออก ประเภท visitor
    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%vis%');")
    in_vis = cursor.fetchall()

    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'U') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%vis%');")
    out_vis = cursor.fetchall()


    #ยอดถคงค้างโดยหาจากป้ายทะเบียนที่ไม่มีป้ายออก ประเภท member
    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%mem%');")
    in_mem = cursor.fetchall()

    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'U') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%mem%');")
    out_mem = cursor.fetchall()
    
    #ยอดถคงค้างโดยหาจากป้ายทะเบียนที่ไม่มีป้ายออก ประเภท Blacklisti
    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%Bla%');")
    in_bla = cursor.fetchall()
    
    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'U') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%Bla%');")
    out_bla = cursor.fetchall()


    #ยอดถคงค้างโดยหาจากป้ายทะเบียนที่ไม่มีป้ายออก ประเภท VIP
    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%vip%');")
    in_vip = cursor.fetchall()

    cursor.execute(f"SELECT count(*) as count FROM history WHERE date(datetime) = CURDATE() AND gate IN(SELECT gate_id FROM gate WHERE short = 'U') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%vip%');")
    out_vip = cursor.fetchall()


    #ยอดรถที่ออก
    data = {
        "in_all": 0,
        "on_site": in_vis[0]['count'] + in_mem[0]['count'] + in_vip[0]['count'],
        "stay_vis": in_vis[0]['count'] - 0,
        "stay_mem": in_mem[0]['count'] - 0,
        "stay_bla": in_bla[0]['count'] - 0,
        "stay_vip": in_vip[0]['count'] - 0,
        "out_vis": out_vis[0]['count'],
        "out_mem": out_mem[0]['count'],
        "out_bla": out_bla[0]['count'],
        "out_vip": out_vip[0]['count'],
        "out_all": out_vis[0]['count'] + out_mem[0]['count'] + out_vip[0]['count']
    }

    cursor.close()
    connection.close()
    return data

@app.get("/last_snapshot")
def last_snapshot():
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM `history` as h , `type_list` as tl WHERE h.types = tl.id AND  `h`.`gate` = 1 ORDER BY `h_id` DESC LIMIT 1")
    result = cursor.fetchone()
    last_g1 = result

    cursor.execute("SELECT * FROM `history` as h , `type_list` as tl WHERE h.types = tl.id AND  `h`.`gate` = 2 ORDER BY `h_id` DESC LIMIT 1")
    result = cursor.fetchone()
    last_g2 = result

    cursor.execute("SELECT * FROM `history` as h , `type_list` as tl WHERE h.types = tl.id AND  `h`.`gate` = 3 ORDER BY `h_id` DESC LIMIT 1")
    result = cursor.fetchone()
    last_g3 = result

    cursor.execute("SELECT * FROM `history` as h , `type_list` as tl WHERE h.types = tl.id AND  `h`.`gate` = 4 ORDER BY `h_id` DESC LIMIT 1")
    result = cursor.fetchone()
    last_g4 = result

    cursor.close()
    connection.close()

    return {
        "last_g1": last_g1,
        "last_g2": last_g2,
        "last_g3": last_g3,
        "last_g4": last_g4
    }


@app.get("/last_transaction")
def last_transaction():
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT h.* , g.gate_name ,g.short , tl.type_name FROM history as h , gate as g , type_list as tl WHERE h.gate = g.gate_id AND h.types = tl.id AND h.gate IN(SELECT gate_id FROM gate WHERE short = 'I')  ORDER BY h_id DESC LIMIT 10")
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result

@app.get("/last_transaction_out")
def last_transaction_out():
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT h.* , g.gate_name ,g.short , tl.type_name FROM history as h , gate as g , type_list as tl WHERE h.gate = g.gate_id AND h.types = tl.id AND h.gate IN(SELECT gate_id FROM gate WHERE short = 'U')  ORDER BY h_id DESC LIMIT 10")
    result = cursor.fetchall()
    cursor.close()
    connection.close()
    # Convert to JSON
    result = json.loads(json.dumps(result, default=str))
    return result

@app.get("/12hr")
def last_12hr():
    # ค้นหายอดนับรถย้อนหลัง 12 ชั่วโมง จากเวลาปัจจุบัน
    connection = connect_to_mysql()
    cursor = connection.cursor(dictionary=True)

    counts_per_hour = []

    current_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    for i in range(12):
        start_time = current_time - timedelta(hours=i)
        end_time = current_time - timedelta(hours=i-1)
        
        sql_query = "SELECT COUNT(*) AS count FROM history WHERE datetime >= %s AND datetime < %s"
        cursor.execute(sql_query, (start_time, end_time))
        result = cursor.fetchone()

        sql_search_vip = "SELECT COUNT(*) AS count FROM history WHERE datetime >= %s AND datetime < %s AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%vip%');"
        cursor.execute(sql_search_vip, (start_time, end_time))
        result_vip = cursor.fetchone()

        sql_search_mem = "SELECT COUNT(*) AS count FROM history WHERE datetime >= %s AND datetime < %s AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%mem%');"
        cursor.execute(sql_search_mem, (start_time, end_time))
        result_mem = cursor.fetchone()

        sql_search_vis = "SELECT COUNT(*) AS count FROM history WHERE datetime >= %s AND datetime < %s AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%vis%');"
        cursor.execute(sql_search_vis, (start_time, end_time))
        result_vis = cursor.fetchone()

        sql_search_bla = "SELECT COUNT(*) AS count FROM history WHERE datetime >= %s AND datetime < %s AND gate IN(SELECT gate_id FROM gate WHERE short = 'I') AND types IN (SELECT id FROM type_list WHERE type_name LIKE '%Bla%');"
        cursor.execute(sql_search_bla, (start_time, end_time))
        result_bla = cursor.fetchone()

        sql_search_out = "SELECT COUNT(*) AS count FROM history WHERE datetime >= %s AND datetime < %s AND gate IN(SELECT gate_id FROM gate WHERE short = 'U')"
        cursor.execute(sql_search_out, (start_time, end_time))
        result_out = cursor.fetchone()

        counts_per_hour.append({
            "name": start_time.strftime("%d/%m %H:%M"),
            #"VIP": result_vip["count"],
            #"Member": result_mem["count"],
            #"Visitor": result_vis["count"],
            #"Blacklist": result_bla["count"]
            "in" : result_vip["count"] + result_mem["count"] + result_vis["count"] + result_bla["count"],
            "out" : result_out["count"]
        })

        # เรียงจากหลังไปหน้า
    counts_per_hour.reverse()

    cursor.close()
    connection.close()

    return counts_per_hour

