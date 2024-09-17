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
    Image
} from "@fluentui/react-components";
import { DoorArrowLeftRegular, DoorArrowRightRegular, EditRegular, DeleteRegular } from '@fluentui/react-icons'
import Swal from 'sweetalert2'
import axios from 'axios';

export default function Gate() {
    const [gates, setGates] = useState([])
    const [checked, setChecked] = useState(false)
    const getData = () => {
        axios.get(import.meta.env.VITE_API + '/gates', {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        })
            .then(data => setGates(data.data))
    }


    useEffect(() => {
        getData()
    }, [!gates])

    return (
        <>
            <div
                style={{
                    color: '#c50f1f',
                    fontSmooth: 'auto',
                    fontSize: 20,
                    fontWeight: 600,
                }}
            >
                กำหนดประตูทางเข้า - ทางออก
            </div>
            <div
                style={{
                    marginTop: 15
                }}
            >
                สามารถกำหนดทางเข้าและทางออก รวมกันได้สูงสุด 4 ประตูเท่านั้น
            </div>

            <div
                style={{

                }}
            >
                <Table arial-label="Default table">
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>
                                ลำดับ
                            </TableHeaderCell>
                            <TableHeaderCell>
                                ip address
                            </TableHeaderCell>
                            <TableHeaderCell>
                                ชื่อประตู
                            </TableHeaderCell>
                            <TableHeaderCell>
                                ประเภท
                            </TableHeaderCell>
                            <TableHeaderCell>

                            </TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            gates && gates.map((item, index) => {
                                return (
                                    <>
                                        <TableRow>
                                            <TableHeaderCell>
                                                {index + 1}
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                {item.gate_ip}
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                {item.gate_name}
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                {
                                                    item.short === 'I' ? 'เข้า' : 'ออก'
                                                }
                                            </TableHeaderCell>
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
                                                                    แก้ไขประตู
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
                                                                        ชื่อประตู
                                                                    </Label>
                                                                    <Input
                                                                        style={{}}
                                                                        value={item.gate_name}
                                                                        id={'gate_name' + item._id}
                                                                        // แก้ไขชื่อประตู เฉพาะกล้อง
                                                                        onChange={(e) => {
                                                                            var find = gates.find(x => x._id === item._id)
                                                                            find.gate_name = e.target.value
                                                                            setGates([...gates])
                                                                        }}
                                                                    />

                                                                    <Label
                                                                        style={{
                                                                            marginTop: 10
                                                                        }}
                                                                    >
                                                                        IP Address ของกล้่อง
                                                                    </Label>
                                                                    <Input
                                                                        style={{
                                                                        }}
                                                                        value={item.gate_ip}
                                                                        id={'gate_ip' + item._id}
                                                                        onChange={(e) => {
                                                                            var find = gates.find(x => x._id === item._id)
                                                                            find.gate_ip = e.target.value
                                                                            setGates([...gates])
                                                                        }}
                                                                    />

                                                                    <Label>
                                                                        ชื่อผู้ใช้งาน (กล้อง)
                                                                    </Label>
                                                                    <Input
                                                                        value={item.LoginName}
                                                                        id={'LoginName' + item._id}
                                                                        onChange={(e) => {
                                                                            var find = gates.find(x => x._id === item._id)
                                                                            find.LoginName = e.target.value
                                                                            setGates([...gates])
                                                                        }}
                                                                    />

                                                                    <Label>
                                                                        รหัสผ่าน (กล้อง)
                                                                    </Label>
                                                                    <Input
                                                                        value={item.LoginPassword}
                                                                        id={'LoginPassword' + item._id}
                                                                        onChange={(e) => {
                                                                            var find = gates.find(x => x._id === item._id)
                                                                            find.LoginPassword = e.target.value
                                                                            setGates([...gates])
                                                                        }}
                                                                    />

                                                                    <Label>
                                                                        Port
                                                                    </Label>
                                                                    <Input
                                                                        value={item.gate_port}
                                                                        id={'port' + item._id}
                                                                        onChange={(e) => {
                                                                            var find = gates.find(x => x._id === item._id)
                                                                            find.gate_port = e.target.value
                                                                            setGates([...gates])
                                                                        }}
                                                                    />

                                                                    <Label
                                                                        style={{
                                                                            marginTop: 10
                                                                        }}
                                                                    >
                                                                        ประเภท
                                                                    </Label>
                                                                    <Select
                                                                        id={'type' + item._id}
                                                                        onChange={(e) => {
                                                                            var find = gates.find(x => x._id === item._id)
                                                                            find.short = e.target.value
                                                                            setGates([...gates])
                                                                        }}
                                                                        value={item.short}
                                                                    >
                                                                        <option
                                                                            value=""
                                                                            disabled
                                                                            selected
                                                                        >
                                                                            เลือกประเภทประตู
                                                                        </option>
                                                                        <option
                                                                            value="I"
                                                                        >
                                                                            เข้า
                                                                        </option>
                                                                        <option
                                                                            value="U"
                                                                        >
                                                                            ออก
                                                                        </option>
                                                                    </Select>
                                                                </div>
                                                                <DialogTrigger disableButtonEnhancement>
                                                                    {/* button hidden */}
                                                                    <button style={{ display: 'none' }} id='dialogTrigger'></button>
                                                                </DialogTrigger>
                                                                <Button
                                                                    appearance="primary"
                                                                    style={{
                                                                        width: '100%',
                                                                        marginTop: 20
                                                                    }}
                                                                    onClick={() => {
                                                                        var formData = new FormData();
                                                                        formData.append('id', item._id);
                                                                        formData.append('gate_name', document.getElementById('gate_name' + item._id).value);
                                                                        formData.append('gate_ip', document.getElementById('gate_ip' + item._id).value);
                                                                        formData.append('LoginName', document.getElementById('LoginName' + item._id).value);
                                                                        formData.append('LoginPassword', document.getElementById('LoginPassword' + item._id).value);
                                                                        formData.append('LoginPasswordgz', item.LoginPasswordgz);
                                                                        formData.append('gate_port', document.getElementById('port' + item._id).value);
                                                                        formData.append('short', document.getElementById('type' + item._id).value);
                                                                        axios.post(import.meta.env.VITE_API + '/gates/update', formData, {
                                                                            headers: {
                                                                                Authorization: 'Bearer ' + sessionStorage.getItem('token')
                                                                            },
                                                                        })
                                                                            .then(data => {
                                                                                if (data.status === 200) {
                                                                                    document.getElementById('dialogTrigger').click()
                                                                                    Swal.fire({
                                                                                        icon: 'success',
                                                                                        title: 'แก้ไขข้อมูลสำเร็จ',
                                                                                        showConfirmButton: false,
                                                                                        timer: 1500
                                                                                    }).then(() => {
                                                                                        getData()
                                                                                    })
                                                                                }
                                                                            })
                                                                    }}
                                                                >
                                                                    บันทึก
                                                                </Button>

                                                                <DialogTrigger disableButtonEnhancement>
                                                                    <Button appearance="secondary"
                                                                        style={{
                                                                            width: '100%',
                                                                            marginTop: 10
                                                                        }}
                                                                        onClick={() => {
                                                                        }}
                                                                    >
                                                                        ยกเลิก
                                                                    </Button>
                                                                </DialogTrigger>
                                                            </DialogContent>
                                                        </DialogBody>
                                                    </DialogSurface>
                                                </Dialog>
                                            </TableHeaderCell>
                                        </TableRow>
                                    </>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </div>
        </>
    )
}