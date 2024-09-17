import React, { useState, useEffect } from 'react';
import { Avatar, Card, Input, Field, Button, Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, Label, Select, Toast, CardHeader, Divider } from '@fluentui/react-components';
import { DatePicker } from "@fluentui/react-datepicker-compat";
import {
    AddCircleRegular,
    SearchRegular,
    PersonCircleRegular,
    StarRegular,
    LockClosedRegular,
    ProhibitedRegular,
    BookContactsRegular,
    PersonNoteRegular
} from '@fluentui/react-icons'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    BarChart,
    Bar,
    Sector,
    Cell
} from "recharts";
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import no_img from '../assets/Images-amico.png'


export default function Dashboard() {
    const navigate = useNavigate()
    const [licensePlate_add, setLicensePlate_add] = useState('')
    const [fullname_add, setFullname_add] = useState('')
    const [type_add, setType_add] = useState('')
    const [type, setType] = useState([])
    const [selectedOptions, setSelectedOptions] = useState([])

    const [data, setData] = useState([])
    const [graphData, setGraphData] = useState([])
    const [lasttraffic, setLasttraffic] = useState([])
    const [lasttrafficout, setLasttrafficout] = useState([])
    const [snap1, setSnap1] = useState([])
    const [snap2, setSnap2] = useState([])
    const [snap3, setSnap3] = useState([])
    const [snap4, setSnap4] = useState([])

    const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
    const [currentTime, setCurrentTime] = useState(moment().format('HH:mm:ss'));

    const getData = () => {
        fetch(import.meta.env.VITE_API + '/dash')
            .then(response => response.json())
            .then(data => {
                setData(data);
            });
    };

    const getGraphData = () => {
        fetch(import.meta.env.VITE_API + '/12hr')
            .then(response => response.json())
            .then(data => {
                setGraphData(data);
            });
    };

    const getType = () => {
        fetch(import.meta.env.VITE_API + '/type_list')
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setType(data);
                    setSelectedOptions(data.map((item) => item.id));
                }
            });
    };

    const getLasttraffic = () => {
        fetch(import.meta.env.VITE_API + '/last_transaction')
            .then(response => response.json())
            .then(data => {
                setLasttraffic(data);
            });
    };

    const getLasttrafficOut = () => {
        fetch(import.meta.env.VITE_API + '/last_transaction_out')
            .then(response => response.json())
            .then(data => {
                setLasttrafficout(data);
            });
    };

    const getLastSnap = () => {
        fetch(import.meta.env.VITE_API + '/last_snapshot')
            .then(response => response.json())
            .then(data => {
                if (data.last_g1.image !== '') {
                    setSnap1(data.last_g1);
                }
                if (data.last_g2.image !== '') {
                    setSnap2(data.last_g2);
                }
                if (data.last_g3.image !== '') {
                    setSnap3(data.last_g3);
                }
                if (data.last_g4.image !== '') {
                    setSnap4(data.last_g4);
                }
            });
    };

    const convert_month = (month) => {
        // แปลงเดือนเป็นตัวอักษร
        switch (month) {
            case 1: return 'มกราคม';
            case 2: return 'กุมภาพันธ์';
            case 3: return 'มีนาคม';
            case 4: return 'เมษายน';
            case 5: return 'พฤษภาคม';
            case 6: return 'มิถุนายน';
            case 7: return 'กรกฎาคม';
            case 8: return 'สิงหาคม';
            case 9: return 'กันยายน';
            case 10: return 'ตุลาคม';
            case 11: return 'พฤศจิกายน';
            case 12: return 'ธันวาคม';
            default: return '';
        }
    };

    const convert_date = (date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        return `${day} ${convert_month(month)} ${year}`;
    };

    const convert_datetime = (date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const hour = d.getHours();
        const minute = d.getMinutes();
        const second = d.getSeconds();
        return `${day} ${convert_month(month)} ${year} / ${hour}:${minute}`;
    };

    const persent = (number) => {
        const result = (number / data.on_site) * 100;
        // ทศนิยม 2 ตำแหน่ง
        return Math.round(result * 100) / 100;
    };

    const loop = () => {
        setInterval(() => {
            getData()
            getLasttraffic()
            getLasttrafficOut()
            getGraphData()
            getLastSnap()
        }, 20000);
    };

    const time_intorval = () => {
        const timer = setInterval(() => {
            const now = moment();
            setCurrentDate(now.format('YYYY-MM-DD'));
            setCurrentTime(now.format('HH:mm:ss'));
        }, 1000); // อัปเดตทุก 1 วินาที

        return () => clearInterval(timer);
    }

    useEffect(() => {
        getData()
        getLasttraffic()
        getLasttrafficOut()
        getType()
        getGraphData()
        getLastSnap()
        loop();
        time_intorval()
    }, []);


    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0px 0px',
                    height: 25,
                    paddingBottom: 10,

                }}
            >
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                        color: '#c50f1f',
                    }}
                >
                    Dashboard
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Avatar name="John Doe"
                        size={40}
                    />
                </div>
            </div>

            <div className="container-fluid"
                style={{
                    padding: 0,
                    margin: 0,
                    marginTop: 10,
                }}
            >
                <div className="row g-3 pt-1"
                    style={{
                    }}
                >
                    <div className="col-12 col-lg">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <PersonCircleRegular
                                    style={{
                                        fontSize: 50,
                                        color: '#c50f1f',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                    }}
                                >
                                    <div>
                                        จำนวนรถเข้าพื้นที่
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {
                                            data.on_site
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <PersonNoteRegular
                                    style={{
                                        fontSize: 50,
                                        color: '#c50f1f',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                    }}
                                >
                                    <div>
                                        Visitor
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {
                                            data.stay_vis
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <StarRegular
                                    style={{
                                        fontSize: 50,
                                        color: '#c50f1f',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                    }}
                                >
                                    <div>
                                        VIP
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {
                                            data.stay_vip
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <BookContactsRegular
                                    style={{
                                        fontSize: 50,
                                        color: '#c50f1f',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                    }}
                                >
                                    <div>
                                        Member
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {
                                            data.stay_mem
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >

                                <ProhibitedRegular
                                    style={{
                                        fontSize: 50,
                                        color: '#c50f1f',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                    }}
                                >
                                    <div>
                                        Blacklist
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {
                                            data.stay_bla
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
                <div className='row g-3 mt-1'>
                    <div className="col-12 col-lg">
                        <Card
                            // appearance='outline'
                            style={{
                                boxShadow: 'none',
                                background: '#D24545'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10
                                }}
                            >
                                <PersonCircleRegular
                                    style={{
                                        fontSize: 50,
                                        color: 'white',
                                    }}
                                />

                                <div
                                    style={{
                                        marginLeft: 10,
                                    }}
                                >
                                    <div style={{
                                        color: 'white'
                                    }}>
                                        จำนวนรถออกพื้นที่
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}
                                    >
                                        {
                                            data.out_all
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            // appearance='outline'
                            style={{
                                boxShadow: 'none',
                                background: '#D24545'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <PersonNoteRegular
                                    style={{
                                        fontSize: 50,
                                        color: 'white',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                        color: 'white'
                                    }}
                                >
                                    <div>
                                        Visitor
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {
                                            data.out_vis
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            // appearance='outline'
                            style={{
                                boxShadow: 'none',
                                background: '#D24545'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <StarRegular
                                    style={{
                                        fontSize: 50,
                                        color: 'white',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                        color: 'white'
                                    }}
                                >
                                    <div>
                                        VIP
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {
                                            data.out_vip
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            // appearance='outline'
                            style={{
                                boxShadow: 'none',
                                background: '#D24545'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <BookContactsRegular
                                    style={{
                                        fontSize: 50,
                                        color: 'white',
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: 10,
                                        color: 'white'
                                    }}
                                >
                                    <div>
                                        Member
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}
                                    >
                                        {
                                            data.out_mem
                                        }
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 col-lg">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div
                                style={{
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 10,
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    color: '#c50f1f'
                                }}>{convert_date(currentDate)}</div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        marginTop: 10
                                    }}
                                >{currentTime} น.</div>
                            </div>
                        </Card>
                    </div>
                </div>
                <div className='row g-3 mt-1'>
                    <div className="col-12 col-lg-3">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                                padding: 15
                            }}
                        >
                            <div
                                style={{
                                    color: '#c50f1f',
                                }}
                            >
                                <b>ภาพถ่ายจากกล้องที่ 1</b>
                            </div>

                            <img src={snap1?.image == '' ? no_img : import.meta.env.VITE_API + '/image/' + snap1.image} alt="traffic"
                                style={{
                                    width: '100%',
                                    height: '240px',
                                    objectFit: 'cover',
                                    borderRadius: 5,
                                    boxShadow: '0px 0px 2px 0px rgba(0,0,0,0.75)'
                                }}
                            />
                            <table style={{
                                width: '100%',
                            }}>
                                <tr>
                                    <td>
                                        <b>ป้ายทะเบียน</b>
                                    </td>
                                    <td>
                                        {snap1.lpr}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>ประเภท</b>
                                    </td>
                                    <td>
                                        {snap1.type_name}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>วันที่ / เวลา</b>
                                    </td>
                                    <td>
                                        {convert_datetime(snap1.datetime)}
                                    </td>
                                </tr>
                            </table>
                        </Card>
                    </div>
                    <div className="col-12 col-lg-3">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                                padding: 15
                            }}
                        >
                            <div
                                style={{
                                    color: '#c50f1f',
                                }}
                            >
                                <b>ภาพถ่ายจากกล้องที่ 2</b>
                            </div>
                            <img src={snap2?.image == null ? no_img : import.meta.env.VITE_API + '/image/' + snap2.image} alt="traffic"
                                style={{
                                    width: '100%',
                                    height: '240px',
                                    objectFit: 'cover',
                                    borderRadius: 5
                                }}
                            />
                            <table style={{
                                width: '100%',
                            }}>
                                <tr>
                                    <td>
                                        <b>ป้ายทะเบียน</b>
                                    </td>
                                    <td>
                                        {snap2.lpr}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>ประเภท</b>
                                    </td>
                                    <td>
                                        {snap2.type_name}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>วันที่ / เวลา</b>
                                    </td>
                                    <td>
                                        {convert_datetime(snap2.datetime)}
                                    </td>
                                </tr>
                            </table>
                        </Card>
                    </div>
                    <div className="col-12 col-lg-3">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                                padding: 15
                            }}
                        >
                            <div
                                style={{
                                    color: '#c50f1f',
                                }}
                            >
                                <b>ภาพถ่ายจากกล้องที่ 3</b>
                            </div>
                            <img src={snap3?.image == null ? no_img : import.meta.env.VITE_API + '/image/' + snap3.image} alt="traffic"
                                style={{
                                    width: '100%',
                                    height: '240px',
                                    objectFit: 'cover',
                                    borderRadius: 5
                                }}
                            />
                            <table style={{
                                width: '100%',
                            }}>
                                <tr>
                                    <td>
                                        <b>ป้ายทะเบียน</b>
                                    </td>
                                    <td>
                                        {snap3.lpr}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>ประเภท</b>
                                    </td>
                                    <td>
                                        {snap3.type_name}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>วันที่ / เวลา</b>
                                    </td>
                                    <td>
                                        {convert_datetime(snap3.datetime)}
                                    </td>
                                </tr>
                            </table>
                        </Card>
                    </div>
                    <div className="col-12 col-lg-3">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                                padding: 15
                            }}
                        >
                            <div
                                style={{
                                    color: '#c50f1f',
                                }}
                            >
                                <b>ภาพถ่ายจากกล้องที่ 4</b>
                            </div>
                            <img src={snap4?.image == null ? no_img : import.meta.env.VITE_API + '/image/' + snap4.image} alt="traffic"
                                style={{
                                    width: '100%',
                                    height: '240px',
                                    objectFit: 'cover',
                                    borderRadius: 5
                                }}
                            />
                            <table style={{
                                width: '100%',
                            }}>
                                <tr>
                                    <td>
                                        <b>ป้ายทะเบียน</b>
                                    </td>
                                    <td>
                                        {snap4.lpr}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>ประเภท</b>
                                    </td>
                                    <td>
                                        {snap4.type_name}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>วันที่ / เวลา</b>
                                    </td>
                                    <td>
                                        {convert_datetime(snap4.datetime)}
                                    </td>
                                </tr>
                            </table>
                        </Card>
                    </div>
                    <div className="col-12 col-lg-6">
                    </div>
                </div>
                <div className='row g-3 mt-2'>
                    <div className="col-12 col-lg-6">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div>
                                กราฟแสดงจำนวนการเข้า-ออกพื้นที่ 12 ชั่วโมงล่าสุด
                            </div>
                            <ResponsiveContainer
                                width="100%"
                                height={400}
                            >
                                <BarChart
                                    width={500}
                                    height={300}
                                    data={graphData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar type="monotone" dataKey="in" fill="#A94438" />
                                    <Bar type="monotone" dataKey="out" fill="#D24545" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                    <div className="col-12 col-lg-6">
                        <Card
                            appearance='outline'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div>
                                สัดส่วนรถเข้า
                            </div>
                            {
                                data.stay_vip != 0 || data.stay_mem != 0 || data.stay_bla != 0 || data.stay_vis != 0 ?
                                    <ResponsiveContainer
                                        width="100%"
                                        height={400}
                                    >

                                        <PieChart>
                                            <Pie
                                                dataKey="value"
                                                isAnimationActive={true}
                                                data={
                                                    [
                                                        { name: 'VIP', value: persent(data.stay_vip) },
                                                        { name: 'Member', value: persent(data.stay_mem) },
                                                        { name: 'Blacklist', value: persent(data.stay_bla) },
                                                        { name: 'Visitor', value: persent(data.stay_vis) },
                                                    ]
                                                }
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={140}
                                                label
                                            >
                                                {
                                                    [
                                                        { name: 'VIP', value: (data.stay_vip / data.on_site * 100).toFixed(2), fill: '#A94438' },
                                                        { name: 'Member', value: (data.stay_mem / data.on_site * 100).toFixed(2), fill: '#D24545' },
                                                        { name: 'Blacklist', value: (data.stay_bla / data.on_site * 100).toFixed(2), fill: '#E6BAA3' },
                                                        { name: 'Visitor', value: (data.stay_vis / data.on_site * 100).toFixed(2), fill: '#E4DEBE' },
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`}
                                                            fill={entry.fill}
                                                        />
                                                    ))
                                                }
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    :
                                    <div
                                        style={{
                                            color: '#A94438',
                                            textAlign: 'center',
                                            height: 400
                                        }}
                                    >
                                        ไม่พบรถเข้าพื้นที่ในวันนี้
                                    </div>
                            }

                        </Card>
                    </div>

                    <div className="col-12 col-lg-6">
                        <Card
                            appearance='filled'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div>
                                รายการการเข้าพื้นที่ล่าสุด
                            </div>
                            <div className="row g-3">
                                {
                                    lasttraffic.map((item, index) => (
                                        <div className="col-12 col-lg-6">
                                            <Card
                                                appearance='outline'
                                                style={{
                                                    boxShadow: 'none',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0 0px 0 0px',
                                                        borderRadius: 10
                                                    }}
                                                >
                                                    <img src={item.image == '' ? no_img : import.meta.env.VITE_API + '/image/' + item.image} alt="traffic"
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            objectFit: 'cover',
                                                            borderRadius: 5,
                                                            marginRight: 20
                                                        }}
                                                        loading='lazy'
                                                    />
                                                    <div
                                                        style={{
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <div>
                                                            {
                                                                item.lpr
                                                            }
                                                        </div>
                                                        <small>
                                                            {
                                                                convert_date(item.datetime)
                                                            }
                                                        </small>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))
                                }

                            </div>
                        </Card>
                    </div>

                    <div className="col-12 col-lg-6">
                        <Card
                            appearance='filled'
                            style={{
                                boxShadow: 'none',
                            }}
                        >
                            <div>
                                รายการการออกล่าสุด
                            </div>
                            <div className="row g-3">
                                {
                                    lasttrafficout.map((item, index) => (
                                        <div className="col-12 col-lg-6">
                                            <Card
                                                appearance='outline'
                                                style={{
                                                    boxShadow: 'none',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0 0px 0 0px',
                                                        borderRadius: 10
                                                    }}
                                                >
                                                    <img src={item.image == '' ? no_img : import.meta.env.VITE_API + '/image/' + item.image} alt="traffic"
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            objectFit: 'cover',
                                                            borderRadius: 5,
                                                            marginRight: 20
                                                        }}
                                                        loading='lazy'
                                                    />
                                                    <div
                                                        style={{
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <div>
                                                            {
                                                                item.lpr
                                                            }
                                                        </div>
                                                        <small>
                                                            {
                                                                convert_date(item.datetime)
                                                            }
                                                        </small>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))
                                }

                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}