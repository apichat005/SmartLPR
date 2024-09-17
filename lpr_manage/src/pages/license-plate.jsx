import React, { useEffect, useState } from 'react'
import {
    BrowserRouter,
    Route,
    Routes,
    useNavigate,
    useLocation,
    json
} from 'react-router-dom'
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
    Field,
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
    Spinner
} from "@fluentui/react-components";
import { AddRegular, EditRegular, DeleteRegular, ListRegular, ArrowDownloadRegular, ArrowUploadRegular, FilterRegular, CalendarAddRegular } from '@fluentui/react-icons'
import Swal from 'sweetalert2';
import ExampleExcel from '../assets/LPR.xlsx'
import axios from 'axios';
import { DatePicker } from '@fluentui/react-datepicker-compat';


export default function Lpr() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [checked, setChecked] = React.useState(false);
    const [keyword, setKeyword] = useState('')

    // setup state
    const [licensePlate, setLicensePlate] = useState([])
    const [type, setType] = useState([])
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectTab, setSelectTab] = useState('tab1')

    // เพิ่มป้ายทะเบียน
    const [fullname_add, setFullname_add] = useState('')
    const [licensePlate_add, setLicensePlate_add] = useState('')
    const [type_add, setType_add] = useState('')
    const [end_date_add, setEnd_date_add] = useState('')

    // อัพโหลดไฟล์ xlsx
    const [file, setFile] = useState(null)
    const [spinner_status, setSpinner_status] = useState(false)

    // เลือกป้ายทะเบียน
    const handleOptionSelect = (event, data) => {
        setSelectedOptions(data.selectedOptions);
    };

    const getType = () => {
        axios.get(import.meta.env.VITE_API + '/type_list', {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        })
            .then(data => {
                if (data.data.length > 0) {
                    setType(data.data)
                    setSelectedOptions(data.data.map((item) => item._id))
                }
            })
    }

    const getData = () => {
        axios.get(import.meta.env.VITE_API + `/list/${page}/${limit}`, {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        })
            .then(data => {
                setLicensePlate(data.data)
            })
    }

    const search = () => {
        var formData = new FormData();
        formData.append('type_list_id', selectedOptions)
        // ส่ง array ไปเช็ค
        fetch(import.meta.env.VITE_API + `/list/${page}/${limit}`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                setLicensePlate(data.data)

            })
    }

    const changeDateFormat = (date) => {
        const newDate = new Date(date)
        // format thai date
        return newDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const upload_datalist = () => {
        setSpinner_status(true)
        var formData = new FormData();
        formData.append('file', file);
        fetch(import.meta.env.VITE_API + '/list/upload', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                if (data.status == 'success') {
                    getData()
                    setSpinner_status(false)
                    document.getElementById('upload_send').click()
                }
            })
    }

    const columns = [
        { columnKey: "id", label: "ลำดับ" },
        { columnKey: "fullname", label: "ชื่อ - นามสกุล" },
        { columnKey: "license_plate", label: "ป้ายทะเบียน" },
        { columnKey: "type_name", label: "ประเภท" },
        { columnKey: "end_date", label: "วันหมดอายุ" },
        { columnKey: "action", label: "" },
    ];


    useEffect(() => {
        getType()
        getData()
    }, [])

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
                    License Plate Recognition
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
                        paddingTop: 0,
                    }}
                >
                    <div className="row g-3">
                        <div className="col-12 col-lg-12"
                            style={{
                                borderRadius: 10,
                                paddingTop: 5
                            }}
                        >
                            <TabList
                                defaultSelectedValue={selectTab}
                            >
                                <Tab value="tab1" onClick={() => setSelectTab('tab1')} icon={<ListRegular />}><span>ข้อมูลทั้งหมด</span></Tab>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button appearance='transparent' icon={<AddRegular />}>
                                            <span>เพิ่มป้ายทะเบียน</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogSurface
                                        style={{
                                            maxWidth: 400
                                        }}
                                    >
                                        <DialogBody>
                                            <DialogTitle>
                                                <div>
                                                    เพิ่มป้ายทะเบียน
                                                </div>
                                            </DialogTitle>
                                            <DialogContent>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 10
                                                    }}
                                                >
                                                    <Field
                                                        label="ป้ายทะเบียน"
                                                        required
                                                        validationMessage={licensePlate_add === '' ? 'กรุณากรอกป้ายทะเบียน' : ''}
                                                    >
                                                        <Input
                                                            onChange={(e) => setLicensePlate_add(e.target.value)}
                                                            value={licensePlate_add}
                                                        />
                                                    </Field>
                                                    <Field
                                                        label="ชื่อ - นามสกุล"
                                                        required
                                                        validationMessage={fullname_add === '' ? 'กรุณากรอกชื่อ - นามสกุล' : ''}
                                                    >
                                                        <Input
                                                            style={{

                                                            }}
                                                            onChange={(e) => setFullname_add(e.target.value)}
                                                            value={fullname_add}
                                                        />
                                                    </Field>

                                                    <Field
                                                        label="ประเภทสมาชิก"
                                                        required
                                                        validationMessage={type_add === '' ? 'กรุณาเลือกประเภทสมาชิก' : ''}
                                                    >
                                                        <Select
                                                            onChange={(e) => {
                                                                setType_add(e.target.value)
                                                            }}
                                                        >
                                                            <option value="" selected disabled>เลือกประเภทสมาชิก</option>
                                                            {type && type.map((item, index) => {
                                                                return (
                                                                    <option
                                                                        key={index}
                                                                        value={item._id}
                                                                    >
                                                                        {item.type_name}
                                                                    </option>
                                                                )
                                                            })}
                                                        </Select>
                                                    </Field>
                                                </div>
                                                <DialogTrigger disableButtonEnhancement>
                                                    <Button appearance="primary"
                                                        style={{
                                                            width: '100%',
                                                            marginTop: 20
                                                        }}
                                                        onClick={(e) => {
                                                            if (fullname_add === '' || licensePlate_add === '' || type_add === '') {
                                                                return e.preventDefault()
                                                            }
                                                            var formData = new FormData();
                                                            formData.append('fullname', fullname_add);
                                                            formData.append('lpr', licensePlate_add);
                                                            formData.append('type_list_id', type_add);
                                                            fetch(import.meta.env.VITE_API + '/list', {
                                                                method: 'POST',
                                                                headers: {
                                                                    Authorization: 'Bearer ' + sessionStorage.getItem('token')
                                                                },
                                                                body: formData
                                                            })
                                                                .then(response => response.json())
                                                                .then(data => {
                                                                    if (data.status === 'success') {
                                                                        Swal.fire({
                                                                            icon: 'success',
                                                                            title: 'เพิ่มข้อมูลสำเร็จ',
                                                                            showConfirmButton: false,
                                                                            timer: 1500
                                                                        }).then(() => {
                                                                            setLicensePlate_add('')
                                                                            setFullname_add('')
                                                                            setType_add('')
                                                                            getData()
                                                                        })
                                                                    }
                                                                })
                                                        }}
                                                    >
                                                        บันทึก
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogTrigger disableButtonEnhancement>
                                                    <Button appearance="secondary"
                                                        style={{
                                                            width: '100%',
                                                            marginTop: 10
                                                        }}
                                                        onClick={() => {
                                                            setLicensePlate_add('')
                                                            setFullname_add('')
                                                            setType_add('')
                                                        }}
                                                    >
                                                        ยกเลิก
                                                    </Button>
                                                </DialogTrigger>
                                            </DialogContent>
                                        </DialogBody>
                                    </DialogSurface>
                                </Dialog>
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
                                                    window.open(import.meta.env.VITE_API + '/export/lpr_excel', '_blank')
                                                }}
                                            >CSV </MenuItem>
                                        </MenuList>
                                    </MenuPopover>
                                </Menu>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button appearance='transparent' icon={<ArrowUploadRegular />}>
                                            <span>อัพโหลด</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogSurface
                                        style={{
                                            maxWidth: 400
                                        }}
                                    >
                                        <DialogBody>
                                            <DialogTitle>
                                                <div>
                                                    อัพโหลดข้อมูล
                                                </div>
                                            </DialogTitle>
                                            <DialogContent>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 10
                                                    }}
                                                >
                                                    <Label>
                                                        เลือกไฟล์ .xlsx ที่จะอัพโหลด (ขนาดไม่เกิน 10 MB)
                                                    </Label>
                                                    <a href='#'>
                                                        <Button
                                                            appearance="flat"
                                                            onClick={() => {
                                                                window.open(ExampleExcel)
                                                            }}
                                                            icon={<ArrowDownloadRegular />}
                                                            style={{
                                                                width: '100%'
                                                            }}
                                                        >
                                                            ดาวน์โหลดตัวอย่าง
                                                        </Button>
                                                    </a>

                                                    <Button
                                                        appearance="transparent"
                                                        onClick={() => {
                                                            document.getElementById('upload').click()
                                                        }}
                                                        icon={<CalendarAddRegular />}
                                                        disabled={file != null}
                                                    >
                                                        เลือกไฟล์
                                                    </Button>
                                                    <input
                                                        type="file"
                                                        id="upload"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            if (e.target.files[0].size > 10485760) {
                                                                return alert('ขนาดไฟล์ต้องไม่เกิน 10 MB')
                                                            } else {
                                                                setFile(e.target.files[0])
                                                            }
                                                        }}
                                                    />
                                                    {
                                                        file != null ?
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    gap: 10
                                                                }}
                                                            >

                                                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                <Button
                                                                    appearance="transparent"
                                                                    onClick={() => {
                                                                        setFile(null)
                                                                    }}
                                                                    icon={<DeleteRegular />}
                                                                >
                                                                    ลบไฟล์
                                                                </Button>
                                                            </div>
                                                            :
                                                            null

                                                    }
                                                </div>
                                                <DialogTrigger disableButtonEnhancement>
                                                    <Button
                                                        style={{
                                                            display: 'none'
                                                        }}
                                                        appearance="primary"
                                                        id="upload_send"
                                                    ></Button>
                                                </DialogTrigger>
                                                <Button appearance="primary"
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 20
                                                    }}
                                                    onClick={() => upload_datalist()}
                                                    disabled={file == null}
                                                >
                                                    {
                                                        spinner_status ?
                                                            <Spinner label="กำลังอัพโหลดข้อมูล..." />
                                                            :
                                                            <>
                                                                อัพโหลด
                                                            </>
                                                    }

                                                </Button>

                                                <DialogTrigger disableButtonEnhancement>
                                                    <Button appearance="secondary"
                                                        style={{
                                                            width: '100%',
                                                            marginTop: 10
                                                        }}
                                                    >
                                                        ยกเลิก
                                                    </Button>
                                                </DialogTrigger>
                                            </DialogContent>
                                        </DialogBody>
                                    </DialogSurface>
                                </Dialog>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button appearance='transparent' icon={<FilterRegular />}>
                                            <span>ตัวกรอง</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogSurface
                                        style={{
                                            maxWidth: 400
                                        }}
                                    >
                                        <DialogBody>
                                            <DialogContent>
                                                <div
                                                    style={{
                                                        fontSize: 18,
                                                        fontWeight: 'bold',
                                                        marginBottom: 5
                                                    }}
                                                >
                                                    คัดกรองข้อมูล
                                                </div>
                                                <Field
                                                    label="ประเภทสมาชิก"
                                                    required
                                                >
                                                    <Dropdown
                                                        multiselect={true}
                                                        selectedOptions={selectedOptions}
                                                        onOptionSelect={handleOptionSelect}
                                                        placeholder='เลือกประเภทสมาชิก'
                                                    >
                                                        {type && type.map((item, index) => {
                                                            return (
                                                                <Option
                                                                    key={index}
                                                                    value={item._id}
                                                                >
                                                                    {item?.type_name}
                                                                </Option>
                                                            )
                                                        })}
                                                    </Dropdown>
                                                </Field>
                                                <div>
                                                    <Button
                                                        appearance='primary'
                                                        style={{
                                                            marginTop: 20,
                                                            width: '100%'
                                                        }}
                                                        onClick={() => {
                                                            search()
                                                        }}
                                                    >
                                                        ค้นหา
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </DialogBody>
                                    </DialogSurface>
                                </Dialog>

                            </TabList>
                            {
                                licensePlate.length > 0 ?
                                    selectTab === 'tab1' && (
                                        <Card
                                            style={{
                                                padding: 10,
                                                // maxHeight: 'calc(100vh - 20px)',
                                                // display: 'flex',
                                                boxShadow: 'none',
                                                overflowX: "auto"
                                            }}
                                        >
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    {
                                                        type && type.map((type, index) => {
                                                            if (selectedOptions.includes(type._id)) {
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
                                                                        {type.type_name}
                                                                    </Button>
                                                                )
                                                            }
                                                        })
                                                    }

                                                </div>
                                                <Input placeholder="ค้นหา"
                                                    onChange={(e) => {
                                                        setKeyword(e.target.value)
                                                    }}
                                                    style={{
                                                        width: 200,
                                                    }}
                                                />
                                            </div>
                                            <Table
                                                arial-label="Default table"

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
                                                        licensePlate.filter((item) => {
                                                            if (keyword === '') {
                                                                return item
                                                            } else if (item.fullname.toLowerCase().includes(keyword.toLowerCase())) {
                                                                return item
                                                            } else if (item.lpr.toLowerCase().includes(keyword.toLowerCase())) {
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
                                                                        {item.fullname}
                                                                    </TableHeaderCell>
                                                                    <TableHeaderCell>{item.lpr}</TableHeaderCell>
                                                                    <TableHeaderCell>{item.data[0].type_name}</TableHeaderCell>
                                                                    <TableHeaderCell>{changeDateFormat(item.end_date)}</TableHeaderCell>
                                                                    <TableHeaderCell
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: 10
                                                                        }}
                                                                    >
                                                                        <Dialog>
                                                                            <DialogTrigger>
                                                                                <Button
                                                                                    appearance='outline'
                                                                                    style={{
                                                                                        fontSize: 12
                                                                                    }}
                                                                                    size='small'
                                                                                    icon={<EditRegular />}
                                                                                    onClick={() => {
                                                                                        setLicensePlate_add(item.lpr)
                                                                                        setFullname_add(item.fullname)
                                                                                        setType_add(item.data[0]._id.$oid)
                                                                                        setEnd_date_add(new Date(item.end_date))
                                                                                    }}
                                                                                >
                                                                                    แก้ไข
                                                                                </Button>

                                                                                {/* <Tab value="tab2" icon={<AddRegular />}></Tab> */}
                                                                            </DialogTrigger>
                                                                            <DialogSurface
                                                                                style={{
                                                                                    maxWidth: 400
                                                                                }}
                                                                            >
                                                                                <DialogBody>
                                                                                    <DialogTitle

                                                                                    >
                                                                                        <div>
                                                                                            แก้ไขป้ายทะเบียน
                                                                                        </div>
                                                                                    </DialogTitle>
                                                                                    <DialogContent>
                                                                                        <div
                                                                                            style={{
                                                                                                display: 'flex',
                                                                                                flexDirection: 'column',
                                                                                                gap: 10
                                                                                            }}
                                                                                        >
                                                                                            <Label>
                                                                                                ป้ายทะเบียน
                                                                                            </Label>
                                                                                            <Input
                                                                                                onChange={(e) => setLicensePlate_add(e.target.value)}
                                                                                                value={licensePlate_add}
                                                                                            />

                                                                                            <Label
                                                                                                style={{
                                                                                                    marginTop: 10
                                                                                                }}
                                                                                            >
                                                                                                ชื่อ - นามสกุล
                                                                                            </Label>
                                                                                            <Input
                                                                                                style={{
                                                                                                }}
                                                                                                onChange={(e) => setFullname_add(e.target.value)}
                                                                                                value={fullname_add}
                                                                                            />

                                                                                            <Label
                                                                                                style={{
                                                                                                    marginTop: 10
                                                                                                }}
                                                                                            >
                                                                                                ประเภทสมาชิก
                                                                                            </Label>
                                                                                            <Select
                                                                                                style={{
                                                                                                }}
                                                                                                onChange={(e) => {
                                                                                                    setType_add(e.target.value)
                                                                                                }}
                                                                                                value={type_add}
                                                                                            >
                                                                                                {type && type.map((item, index) => {
                                                                                                    return (
                                                                                                        <option
                                                                                                            key={index}
                                                                                                            value={item._id}
                                                                                                        >
                                                                                                            {item.type_name}
                                                                                                        </option>
                                                                                                    )
                                                                                                })}
                                                                                            </Select>

                                                                                            <Label
                                                                                                style={{
                                                                                                    marginTop: 10
                                                                                                }}
                                                                                            >
                                                                                                วันหมดอายุ
                                                                                            </Label>
                                                                                            <DatePicker
                                                                                                value={end_date_add}
                                                                                                onSelectDate={(date) => setEnd_date_add(date)}
                                                                                                minDate={new Date()}
                                                                                                formatDate={(date) => {
                                                                                                    const newDate = new Date(date)
                                                                                                    return newDate.toLocaleDateString('th-TH', {
                                                                                                        year: 'numeric',
                                                                                                        month: 'long',
                                                                                                        day: 'numeric',
                                                                                                    })
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                        <DialogTrigger disableButtonEnhancement>
                                                                                            <Button
                                                                                                appearance="primary"
                                                                                                style={{
                                                                                                    width: '100%',
                                                                                                    marginTop: 20
                                                                                                }}
                                                                                                onClick={() => {
                                                                                                    var formData = new FormData();
                                                                                                    formData.append('id', item._id.$oid);
                                                                                                    formData.append('fullname', fullname_add);
                                                                                                    formData.append('lpr', licensePlate_add);
                                                                                                    formData.append('type_list_id', type_add);
                                                                                                    formData.append('end_date', end_date_add);
                                                                                                    axios.post(import.meta.env.VITE_API + '/list/update', formData, {
                                                                                                        headers: {
                                                                                                            Authorization: 'Bearer ' + sessionStorage.getItem('token')
                                                                                                        },
                                                                                                    })
                                                                                                        .then(data => {
                                                                                                            if (data.data.status === 200) {
                                                                                                                Swal.fire({
                                                                                                                    icon: 'success',
                                                                                                                    title: 'แก้ไขข้อมูลสำเร็จ',
                                                                                                                    showConfirmButton: false,
                                                                                                                    timer: 1500
                                                                                                                }).then(() => {
                                                                                                                    setLicensePlate_add('')
                                                                                                                    setFullname_add('')
                                                                                                                    setType_add('')
                                                                                                                    setEnd_date_add('')
                                                                                                                    setChecked(false)
                                                                                                                    getData()
                                                                                                                })
                                                                                                            }
                                                                                                        })
                                                                                                }}
                                                                                            >
                                                                                                บันทึก
                                                                                            </Button>
                                                                                        </DialogTrigger>
                                                                                        <DialogTrigger disableButtonEnhancement>
                                                                                            <Button appearance="secondary"
                                                                                                style={{
                                                                                                    width: '100%',
                                                                                                    marginTop: 10
                                                                                                }}
                                                                                                onClick={() => {
                                                                                                    setLicensePlate_add('')
                                                                                                    setFullname_add('')
                                                                                                    setType_add('')
                                                                                                    setEnd_date_add('')
                                                                                                }}
                                                                                            >
                                                                                                ยกเลิก
                                                                                            </Button>
                                                                                        </DialogTrigger>
                                                                                    </DialogContent>
                                                                                </DialogBody>
                                                                            </DialogSurface>
                                                                        </Dialog>

                                                                        <Dialog modalType="non-modal">
                                                                            <DialogTrigger disableButtonEnhancement>
                                                                                <Button
                                                                                    appearance='outline'
                                                                                    style={{
                                                                                        fontSize: 12
                                                                                    }}
                                                                                    size='small'
                                                                                    icon={<DeleteRegular />}
                                                                                >
                                                                                    ลบ
                                                                                </Button>
                                                                            </DialogTrigger>
                                                                            <DialogSurface aria-describedby={undefined}>
                                                                                <DialogBody>
                                                                                    <DialogTitle>
                                                                                        <div>
                                                                                            ลบข้อมูลนี้ ?
                                                                                        </div>
                                                                                    </DialogTitle>
                                                                                    <DialogContent>
                                                                                        <p>
                                                                                            คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้และข้อมูลที่เกี่ยวข้องทั้งหมด
                                                                                        </p>
                                                                                        <Checkbox
                                                                                            checked={checked}
                                                                                            onChange={() => setChecked(!checked)}
                                                                                            label="ยืนยันการลบข้อมูล"
                                                                                        />
                                                                                    </DialogContent>
                                                                                    <DialogActions>
                                                                                        <DialogTrigger disableButtonEnhancement>
                                                                                            <Button disabled={!checked} appearance="primary"
                                                                                                onClick={() => {
                                                                                                    axios.delete(import.meta.env.VITE_API + '/list/' + item._id.$oid, {
                                                                                                        headers: {
                                                                                                            Authorization: 'Bearer ' + sessionStorage.getItem('token')
                                                                                                        }
                                                                                                    })
                                                                                                        .then(data => {
                                                                                                            if (data.data.status === 200) {
                                                                                                                Swal.fire({
                                                                                                                    icon: 'success',
                                                                                                                    title: 'ลบข้อมูลสำเร็จ',
                                                                                                                    showConfirmButton: false,
                                                                                                                    timer: 1500
                                                                                                                }).then(() => {
                                                                                                                    getData()
                                                                                                                })
                                                                                                            }
                                                                                                        })
                                                                                                }}
                                                                                            >
                                                                                                ยืนยัน
                                                                                            </Button>
                                                                                        </DialogTrigger>
                                                                                        <DialogTrigger disableButtonEnhancement>
                                                                                            <Button appearance="secondary" onClick={() => {
                                                                                                setChecked(false)
                                                                                            }}>
                                                                                                ยกเลิก
                                                                                            </Button>
                                                                                        </DialogTrigger>
                                                                                    </DialogActions>
                                                                                </DialogBody>
                                                                            </DialogSurface>
                                                                        </Dialog>

                                                                    </TableHeaderCell>
                                                                </TableRow>
                                                            )
                                                        })
                                                    }
                                                </TableBody>
                                            </Table>
                                        </Card>
                                    )
                                    :
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 16
                                        }}
                                    >

                                        ไม่พบข้อมูล
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}