import React, { useEffect, useState } from 'react'
import {
    BrowserRouter,
    Route,
    Routes,
    useNavigate,
    useLocation,
    json
} from 'react-router-dom'
import { DatePicker } from "@fluentui/react-datepicker-compat";
import {
    TimePicker,
    formatDateToTimeString,
} from "@fluentui/react-timepicker-compat";
import {
    Avatar,
    Card,
    Combobox,
    Checkbox,
    Input,
    Option,
    Label,
    Button,
    Tab,
    Table,
    TabList,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    RatingItemProvider,
    Divider,
    Dropdown,
    Select,
    useId,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogBody,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover,
    Field,
    Image,
    makeStyles
} from "@fluentui/react-components";
import { AddRegular, EditRegular, DeleteRegular, ListRegular, ArrowDownloadRegular, MoreHorizontalRegular, FilterRegular } from '@fluentui/react-icons'
import useSWR from 'swr'

export default function Lpr() {
    const navigate = useNavigate()
    const [checked, setChecked] = React.useState(false);
    const [keyword, setKeyword] = useState('')
    const [datestart, setDatestart] = useState(null)
    const [dateend, setDateend] = useState(null)
    const [gates, setGates] = useState([])

    // setup state
    const [licensePlate, setLicensePlate] = useState([])
    const [type, setType] = useState([])
    const [selectedOptions, setSelectedOptions] = useState([]);

    const [starttime, setStarttime] = useState(null)
    const [endtime, setEndtime] = useState(null)

    // เลือกป้ายทะเบียน
    const handleOptionSelect = (event, data) => {
        setSelectedOptions(data.selectedOptions);
    };

    const geteGate = () => {
        fetch(import.meta.env.VITE_API + '/gates', {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const updatedData = data.map(element => {
                        return { ...element, status: true };
                    });
                    setGates(updatedData);
                }
            })

    }
    const getType = () => {
        fetch(import.meta.env.VITE_API + '/type_list', {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setType(data)
                    setSelectedOptions(data.map((item) => item._id))
                }
            })
    }

    const getData = () => {
        const selectedGateIds = [];
        gates.forEach(element => {
            if (element.status) {
                selectedGateIds.push(element._id);
            }
        });

        var formData = new FormData();
        formData.append('datestart', trandate(datestart));
        formData.append('dateend', trandate(dateend));
        formData.append('types', selectedOptions);
        formData.append('gates', selectedGateIds);
        formData.append('starttime', starttime);
        formData.append('endtime', endtime);

        fetch(import.meta.env.VITE_API + '/history/all', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // if (data.length > 0) {
                setLicensePlate(data)
                // }
            })
    }



    const getDate = () => {
        var today = new Date();
        setDatestart(today)
        setDateend(today)
        // set starttime 00:00
        setStarttime('00:00')
        // set endtime 23:59
        setEndtime('23:59')

    }

    const exportExcel = () => {
        const selectedGateIds = [];
        gates.forEach(element => {
            if (element.status) {
                selectedGateIds.push(element.gate_id);
            }
        });

        window.open(`${import.meta.env.VITE_API}/export/report_excel/${trandate(datestart)}/${trandate(dateend)}/${selectedOptions}/${selectedGateIds}/${starttime}/${endtime}`, '_blank')
    }

    const trandate = (date) => {
        // แปลงวันที่เป็น ปี-เดือน-วัน
        var date = new Date(date);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return year + "-" + month + "-" + day;
    }

    const changeDateFormat = (date) => {
        const newDate = new Date(date)
        return newDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            // แสดงเวลา โดยไม่ต้องใส่เวลา
            hour: 'numeric',
            minute: 'numeric',
        })
    }

    const columns = [
        { columnKey: "id", label: "ลำดับ" },
        { columnKey: "datetime", label: "วันที่เข้า" },
        { columnKey: "lpr", label: "ป้ายทะเบียน" },
        { columnKey: "types", label: "ประเภทสมาชิก" },
        { columnKey: "type_name", label: "ประเภท" },
        { columnKey: "action", label: "" },
    ];




    useEffect(() => {
        geteGate()
        getType()
        getDate()
        if (datestart && dateend && selectedOptions) {
            getData()
        }

    }, [!datestart, !dateend, !selectedOptions.length])

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0px 0px',
                    height: 25,
                }}
            >
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                        color: '#c50f1f',
                    }}
                >
                    History License Plate
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
                }}
            >
                <div
                    style={{
                        paddingTop: 10,
                    }}
                >
                    <div className="row g-3">
                        <div className="col-12 col-lg-3">
                            <Card
                                style={{
                                    padding: 10,
                                    boxShadow: 'none'
                                }}
                            >
                                <div className="row g-2">
                                    <div className="col-12 col-lg-7">
                                        <Field
                                            label="ตั้งแต่วันที่"
                                        >
                                            <DatePicker
                                                placeholder='เลือกวันที่'
                                                style={{
                                                    width: '100%',
                                                }}
                                                // แปลงวันที่เป็นภาษาไทย
                                                formatDate={(date) => {
                                                    const newDate = new Date(date)
                                                    return newDate.toLocaleDateString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })
                                                }}
                                                value={datestart}
                                                onSelectDate={(e) => {
                                                    setDatestart(e)
                                                }}
                                            />
                                        </Field>
                                    </div>
                                    <div className="col-12 col-lg-5">
                                        <Field label="เลือกเวลา">
                                            <Input
                                                placeholder='เลือกเวลา'
                                                style={{
                                                    width: '100%',
                                                }}
                                                type='time'
                                                value={starttime}
                                                onChange={(e) => {
                                                    setStarttime(e.target.value)
                                                }}
                                            />
                                        </Field>
                                    </div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-12 col-lg-7">
                                        <Field
                                            label="ถึงวันที่"
                                        >
                                            <DatePicker
                                                placeholder='เลือกวันที่'
                                                style={{
                                                    width: '100%',
                                                }}
                                                // แปลงวันที่เป็นภาษาไทย
                                                formatDate={(date) => {
                                                    const newDate = new Date(date)
                                                    return newDate.toLocaleDateString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })
                                                }}
                                                value={dateend}
                                                onSelectDate={(e) => {
                                                    setDateend(e)
                                                }}
                                            />
                                        </Field>
                                    </div>
                                    <div className="col-12 col-lg-5">
                                        <Field label="เลือกเวลา">
                                            <Input
                                                placeholder='เลือกเวลา'
                                                style={{
                                                    width: '100%',
                                                }}
                                                type='time'
                                                value={endtime}
                                                onChange={(e) => {
                                                    setEndtime(e.target.value)
                                                }}
                                            />
                                        </Field>
                                    </div>
                                </div>
                                <Field
                                    label="ทางเข้า-ออก"
                                >
                                    {
                                        gates && gates.map((item, index) => {
                                            console.log(item)
                                            return (
                                                <Checkbox
                                                    key={index}
                                                    value={item._id}
                                                    checked={item.status}
                                                    onChange={() => {
                                                        var updatedGates = [...gates];
                                                        updatedGates[index].status = !updatedGates[index].status;
                                                        setGates(updatedGates);
                                                    }}
                                                    label={item.gate_name}
                                                />
                                            )
                                        })
                                    }
                                </Field>
                                <Field
                                    label="ประเภทสมาชิก"
                                >
                                    <Dropdown
                                        multiselect={true}
                                        selectedOptions={selectedOptions}
                                        onOptionSelect={handleOptionSelect}
                                        placeholder='เลือกประเภทสมาชิก'
                                        style={{

                                        }}
                                    >
                                        {type && type.map((item, index) => {
                                            return (
                                                <Option
                                                    key={index}
                                                    value={item._id}
                                                >
                                                    {item.type_name}
                                                </Option>
                                            )
                                        })}
                                    </Dropdown>
                                </Field>

                                <Button
                                    appearance='primary'
                                    style={{
                                        marginTop: 10,

                                    }}
                                    onClick={() => {
                                        getData()
                                    }}
                                >
                                    ค้นหา
                                </Button>
                            </Card>
                        </div>
                        <div className="col-12 col-lg-9 pt-2"
                            style={{
                                // height: 'calc(100vh - 80px)',
                                borderRadius: 10,
                                paddingTop: 5
                            }}
                        >
                            <TabList>
                                <Tab
                                    icon={<ListRegular />}
                                ><span>ข้อมูลทั้งหมด</span></Tab>
                                <Menu>
                                    <MenuTrigger disableButtonEnhancement>
                                        <Button appearance='transparent' icon={<ArrowDownloadRegular />}>
                                            <span>ดาวโหลด</span>
                                        </Button>
                                    </MenuTrigger>
                                    <MenuPopover>
                                        <MenuList>
                                            <MenuItem
                                                onClick={() => {
                                                    exportExcel()
                                                }}
                                            >CSV </MenuItem>
                                        </MenuList>
                                    </MenuPopover>
                                </Menu>
                            </TabList>
                            <Card
                                style={{
                                    padding: 10,
                                    display: 'flex',
                                    boxShadow: 'none',
                                    overflowX: "auto"
                                }}
                            >
                                <div className="d-flex justify-content-between">
                                    <div>
                                        {
                                            selectedOptions && selectedOptions.map((item, index) => {
                                                return (
                                                    <Button
                                                        key={index}
                                                        appearance='primary'
                                                        style={{
                                                            fontSize: 12,
                                                            marginRight: 5
                                                        }}
                                                        size='small'
                                                    >
                                                        {type && type.find((type) => type._id === item).type_name}
                                                    </Button>
                                                )
                                            })

                                        }

                                    </div>
                                    <Field
                                        hint="กรอกป้ายทะเบียน หรือ ประเภทสมาชิก"
                                    >
                                        <Input
                                            onChange={(e) => {
                                                setKeyword(e.target.value)
                                            }}
                                            style={{
                                                width: 200,

                                            }}
                                            placeholder="ค้นหา"
                                        />
                                    </Field>
                                </div>

                                {
                                    licensePlate.length > 0 ? (
                                        <Table
                                            arial-label="Default table"
                                            sortable
                                        >
                                            <TableHeader>
                                                <TableRow>
                                                    {columns.map((column) => (
                                                        <TableHeaderCell key={column.columnKey}>
                                                            {column.label}
                                                        </TableHeaderCell>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {
                                                    licensePlate && licensePlate.filter((item) => {
                                                        if (keyword === '') {
                                                            return item
                                                        } else if (item.lpr.toLowerCase().includes(keyword.toLowerCase())) {
                                                            return item
                                                        } else if (item.type_name.toLowerCase().includes(keyword.toLowerCase())) {
                                                            return item
                                                        }
                                                    }).map((item, index) => {
                                                        return (
                                                            <TableRow key={index}
                                                                style={{
                                                                    cursor: 'pointer',

                                                                }}
                                                            >
                                                                <TableHeaderCell>{index + 1}</TableHeaderCell>
                                                                <TableHeaderCell>
                                                                    {changeDateFormat(item.datetime)}
                                                                </TableHeaderCell>
                                                                <TableHeaderCell>
                                                                    {item.lpr}
                                                                </TableHeaderCell>
                                                                <TableHeaderCell>
                                                                    {item.type_name}
                                                                </TableHeaderCell>
                                                                <TableHeaderCell>{item.short == 'I' ? 'เข้าพื้นที่' : 'ออกจากพื้นที่'}</TableHeaderCell>
                                                                <TableHeaderCell>
                                                                    <Dialog>
                                                                        <DialogTrigger>
                                                                            <Button
                                                                                appearance='transparent'
                                                                                size='small'
                                                                                icon={<MoreHorizontalRegular />}
                                                                            >
                                                                                ดูเพิ่มเติม
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogSurface
                                                                        >
                                                                            <Image src={import.meta.env.VITE_API + '/image/' + item.image}
                                                                                style={{
                                                                                    width: '100%'
                                                                                }}
                                                                            />
                                                                        </DialogSurface>
                                                                    </Dialog>

                                                                </TableHeaderCell>
                                                            </TableRow>
                                                        )
                                                    })
                                                }

                                            </TableBody>
                                        </Table>
                                    )
                                        :
                                        <div
                                            style={{
                                                fontSize: 16,
                                                textAlign: 'center',
                                            }}
                                        >

                                            ไม่พบข้อมูล
                                        </div>
                                }
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


// ยอดทั้งหมด
// member ทั้งหมด
// แยกตาม