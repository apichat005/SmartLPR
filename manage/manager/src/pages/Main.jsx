import { makeStyles, Tab, TabList } from "@fluentui/react-components";
import { Nav } from "office-ui-fabric-react"
import { useEffect, useState } from "react"

export default function Main() {
    return (
        <>
            <div className="wapper">
                <div className="sidebar">
                    <div className="text-center">
                        <img src="/public/image.png" alt="logo"
                            style={{
                                width: 'auto',
                                height: 80,
                                marginTop: 10
                            }}
                        />

                        <div style={{ marginTop: 20 }}>
                            <Nav
                                groups={[
                                    {
                                        links: [
                                            {
                                                name: 'Home',
                                                url: 'http://example.com',
                                                links: [
                                                    {
                                                        name: 'Activity',
                                                        url: 'http://msn.com',
                                                        key: 'key1'
                                                    },
                                                    {
                                                        name: 'News',
                                                        url: 'http://msn.com',
                                                        key: 'key2'
                                                    }
                                                ],
                                                isExpanded: true
                                            },
                                            { name: 'Documents', url: 'http://example.com', key: 'key3', isExpanded: true },
                                            { name: 'Pages', url: 'http://msn.com', key: 'key4' },
                                            { name: 'Notebook', url: 'http://msn.com', key: 'key5' },
                                            { name: 'Long Name Test for ellipse', url: 'http://msn.com', key: 'key6' },
                                            {
                                                name: 'Edit',
                                                url: 'http://cnn.com',
                                                // onClick: this._onClickHandler2,
                                                icon: 'Edit',
                                                key: 'key8'
                                            },
                                            {
                                                name: 'Delete',
                                                url: 'http://cnn.com',
                                                // onClick: this._onClickHandler2,
                                                iconProps: { iconName: 'Delete' },
                                                key: 'key9'
                                            }
                                        ]
                                    }
                                ]}
                                expandedStateText={'expanded'}
                                collapsedStateText={'collapsed'}
                                selectedKey={'key3'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}