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
    Image,
    Badge
} from "@fluentui/react-components";
import { DoorArrowLeftRegular, DoorArrowRightRegular, EditRegular, DeleteRegular } from '@fluentui/react-icons'
import Swal from 'sweetalert2'
import axios from 'axios';

export default function Type_list() {

    const [typeList, setTypeList] = useState([])

    const getData = () => {
        fetch(import.meta.env.VITE_API + '/type_list', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        })
            .then(response => response.json())
            .then(data => setTypeList(data))
    }

    useEffect(() => {
        getData()
    }, [])

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
                ประเภททะเบียน
            </div>
            <div
                style={{
                    marginTop: 15
                }}
            >
                {/* สามารถกำหนดทางเข้าและทางออก รวมกันได้สูงสุด 4 ประตูเท่านั้น */}
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
                                ชื่อประเภท
                            </TableHeaderCell>
                            <TableHeaderCell>
                                ส่งไลน์
                            </TableHeaderCell>
                            <TableHeaderCell>
                                เปิดไม้กั้น
                            </TableHeaderCell>
                            <TableHeaderCell>

                            </TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            typeList.map((item, index) => (
                                <>
                                    <TableRow>
                                        <TableHeaderCell>
                                            {index + 1}
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            {item.type_name}
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            {
                                                item.send_line == 1 ? (
                                                    <>
                                                        <Badge appearance="filled" color="success"
                                                            style={{
                                                                width: 50
                                                            }}
                                                        >เปิด</Badge>
                                                    </>
                                                ) :
                                                    (
                                                        <>
                                                            <Badge appearance="filled" color="informative"
                                                                style={{
                                                                    width: 50
                                                                }}
                                                            >ปิด</Badge>
                                                        </>
                                                    )
                                            }
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            {item.open_gate == 1 ? (
                                                <>
                                                    <Badge appearance="filled" color="success"
                                                        style={{
                                                            width: 50
                                                        }}
                                                    >เปิด</Badge>
                                                </>
                                            ) :
                                                (
                                                    <>
                                                        <Badge appearance="filled" color="informative"
                                                            style={{
                                                                width: 50
                                                            }}
                                                        >ปิด</Badge>
                                                    </>
                                                )
                                            }
                                        </TableHeaderCell>
                                        <TableHeaderCell>
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
                                                </DialogTrigger>
                                                <DialogSurface
                                                    style={{
                                                        width: 400
                                                    }}
                                                >
                                                    <DialogTitle>
                                                        แก้ไขประเภท
                                                    </DialogTitle>
                                                    <DialogContent>
                                                        <div className="row g-2">
                                                            <div className="col-12 col-lg-12">
                                                                <Field
                                                                    label="ชื่อประเภท"
                                                                    htmlFor="type_name"
                                                                    required
                                                                    style={{
                                                                        marginTop: 10
                                                                    }}
                                                                >
                                                                    <Input
                                                                        id={"type_name" + item._id}
                                                                        value={item.type_name}
                                                                        onChange={(e) => {
                                                                            var find = typeList.find(x => x._id == item._id)
                                                                            find.type_name = e.target.value
                                                                            setTypeList([...typeList])
                                                                        }}
                                                                    />
                                                                </Field>
                                                            </div>

                                                            <div>
                                                                จัดการขั้นสูง
                                                            </div>
                                                            <div className="col-12 col-lg-6"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    id={"send_line" + item._id}
                                                                    checked={item.send_line == 1 ? true : false}
                                                                    onChange={(e) => {
                                                                        var find = typeList.find(x => x._id == item._id)
                                                                        find.send_line = e.target.checked ? 1 : 0
                                                                        setTypeList([...typeList])
                                                                    }}
                                                                    label={"ส่งไลน์"}
                                                                />
                                                            </div>

                                                            <div className="col-12 col-lg-6"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                            >

                                                                <Checkbox
                                                                    id={"open_gate" + item._id}
                                                                    checked={item.open_gate == 1 ? true : false}
                                                                    onChange={(e) => {
                                                                        var find = typeList.find(x => x._id == item._id)
                                                                        find.open_gate = e.target.checked ? 1 : 0
                                                                        setTypeList([...typeList])
                                                                    }}
                                                                    label={"เปิดไม้กั้น"}
                                                                />
                                                            </div>

                                                            <div className="col-12 col-lg-12">
                                                                <Field
                                                                    label="กำหนดจำนวนวันที่สามารถเข้าออกได้"
                                                                    htmlFor="type_name"
                                                                    required
                                                                    style={{
                                                                        marginTop: 10
                                                                    }}
                                                                >
                                                                    <small>
                                                                        โดยจำนวนวันที่สามารถเข้าออกได้จะเริ่มนับตั้งแต่วันที่ปัจจุบัน
                                                                    </small>
                                                                    <Input
                                                                        id={"_exp" + item._id}
                                                                        value={item._exp}
                                                                        type='number'
                                                                        onChange={(e) => {
                                                                            var find = typeList.find(x => x._id == item._id)
                                                                            find._exp = e.target.value
                                                                            setTypeList([...typeList])
                                                                        }}
                                                                    />
                                                                </Field>
                                                            </div>

                                                            <div className="col-12 col-lg-12">
                                                                <DialogTrigger disableButtonEnhancement>
                                                                    <button style={{ display: 'none' }}
                                                                        id='dialog-confirm'
                                                                    ></button>
                                                                </DialogTrigger>
                                                                <Button
                                                                    appearance='primary'
                                                                    style={{
                                                                        marginTop: 1,
                                                                        width: '100%'
                                                                    }}
                                                                    onClick={() => {
                                                                        var formData = new FormData();
                                                                        formData.append('id', item._id)
                                                                        formData.append('type_name', document.getElementById("type_name" + item._id).value)
                                                                        formData.append('send_line', document.getElementById("send_line" + item._id).checked ? 1 : 0)
                                                                        formData.append('open_gate', document.getElementById("open_gate" + item._id).checked ? 1 : 0)

                                                                        axios.post(import.meta.env.VITE_API + '/type_list/update', formData, {
                                                                            headers: {
                                                                                Authorization: 'Bearer ' + sessionStorage.getItem('token')
                                                                            },
                                                                        })
                                                                            .then(res => {
                                                                                if (res.data.status == 200) {
                                                                                    document.getElementById('dialog-confirm').click()
                                                                                    Swal.fire({
                                                                                        icon: 'success',
                                                                                        title: 'บันทึกสําเร็จ',
                                                                                        showConfirmButton: false,
                                                                                        timer: 1500
                                                                                    }).then(() => {
                                                                                        getData()
                                                                                    })
                                                                                } else {
                                                                                    document.getElementById('dialog-confirm').click()
                                                                                    Swal.fire({
                                                                                        icon: 'error',
                                                                                        title: 'บันทึกไม่สําเร็จ',
                                                                                        showConfirmButton: false,
                                                                                        timer: 1500
                                                                                    })
                                                                                }
                                                                            })
                                                                    }}
                                                                >
                                                                    บันทึก
                                                                </Button>
                                                            </div>
                                                            <div className='col-12 col-lg-12'>
                                                                <DialogTrigger disableButtonEnhancement>
                                                                    <Button
                                                                        appearance='subtle'
                                                                        style={{
                                                                            width: '100%'
                                                                        }}
                                                                        onClick={() => {

                                                                        }}
                                                                    >
                                                                        ยกเลิก
                                                                    </Button>
                                                                </DialogTrigger>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </DialogSurface>
                                            </Dialog>
                                        </TableHeaderCell>
                                    </TableRow>
                                </>
                            ))
                        }
                    </TableBody >
                </Table >
            </div>
        </>
    )
}