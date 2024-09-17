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
import Gate from './settings/gate';
import Line from './settings/line';
import Type_list from './settings/type_list';
import Account from './settings/account';
import Group from './settings/group';
const Settings = () => {
    const navigate = useNavigate()

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
                    Settings
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
                            <TabList
                                vertical
                                size="large"
                            >
                                <Tab value=""
                                    onClick={() => navigate('')}
                                >
                                    <div>
                                        ประตูทางเข้า-ออก
                                    </div>
                                </Tab>
                                <Tab value="license-plate"
                                    onClick={() => navigate('line')}
                                >
                                    <div>
                                        กำหนด Line Notify
                                    </div>
                                </Tab>
                                <Tab value="type_list"
                                    onClick={() => navigate('type_list')}
                                >
                                    <div>
                                        ประเภททะเบียน
                                    </div>
                                </Tab>
                                <Tab value="account"
                                    onClick={() => navigate('account')}
                                >
                                    <div>
                                        บัญชีผู้ใช้
                                    </div>
                                </Tab>
                                <Tab value="group"
                                    onClick={() => navigate('group')}
                                >
                                    <div>
                                        กลุ่มผู้ใช้
                                    </div>
                                </Tab>
                            </TabList>
                        </div>
                        <div className="col-12 col-lg-9 pt-2"
                            style={{
                                // height: 'calc(100vh - 80px)',
                                borderRadius: 10,
                                paddingTop: 5
                            }}
                        >
                            <Routes>
                                <Route path="/" element={<Gate />} />
                                <Route path="/line" element={<Line />} />
                                <Route path="/type_list" element={<Type_list />} />
                                <Route path="/account" element={<Account />} />
                                <Route path="/group" element={<Group />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Settings