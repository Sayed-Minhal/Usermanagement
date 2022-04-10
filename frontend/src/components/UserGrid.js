import React, { useEffect, useState } from "react";
import GridTable from '@nadavshaar/react-grid-table';
import axios from 'axios';

const UserGrid = () => {
    const [tableData, setTableData] = useState([]);
    const [updatedRow, setUpdatedRow] = useState({});

    const exportToCSV = () => {
        axios.post("http://localhost:8181/users/csv", tableData, { responseType: 'blob' })
            .then(result => {
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'data.csv'); //or any other extension
                document.body.appendChild(link);
                link.click();
            })
            .catch(error => console.log(error))
    }

    const cellEditHandler = ({ tableManager, value, data, column, colIndex, rowIndex, onChange }) => (
        <div style={{ display: 'inline-flex' }}>
            <button
                style={{ marginLeft: 20 }}
                onClick={e => tableManager.rowEditApi.setEditRowId(null)}
            >&#x2716;</button>
            <button
                style={{ marginLeft: 20, marginRight: 20 }}
                onClick={e => {
                    let rowsClone = tableManager.rowsApi.rows.map(row => {
                        if (row.id === data.id) {
                            setUpdatedRow(data);
                            axios.post("http://localhost:8181/users/update", data)
                                .then(result => console.log("Successfully updated : ", data.id, " for ", data.name))
                                .catch(error => console.log("Unable to update: ", data.id, " for ", data.name))
                            return data;
                        } else {
                            return row;
                        }
                    });
                    setTableData(rowsClone);
                    tableManager.rowEditApi.setEditRowId(null);
                }
                }>&#x2714;</button>
        </div>
    );

    const columns = [
        {
            id: 1,
            field: 'id',
            label: 'User ID',
            className: 'rgt-cell-align-left',
            width: '10%'
        },
        {
            id: 2,
            field: 'name',
            label: 'User Name',
            className: 'rgt-cell-align-left'
        },
        {
            id: 3,
            field: 'email',
            label: 'E Mail',
            className: 'rgt-cell-align-left'
        },
        {
            id: 4,
            field: 'gender',
            label: 'Gender',
            className: 'rgt-cell-align-left'
        },
        {
            id: 5,
            field: 'status',
            label: 'Status',
            className: 'rgt-cell-align-left'
        },
        {
            id: 6,
            field: 'email',
            label: 'E Mail',
            className: 'rgt-cell-align-left'
        },
        {
            id: 'my-buttons-column',
            width: '10%',
            pinned: true,
            sortable: false,
            resizable: false,
            cellRenderer: ({ tableManager, value, data, column, colIndex, rowIndex }) => (
                <button
                    style={{ marginLeft: 20 }}
                    onClick={e => tableManager.rowEditApi.setEditRowId(data.id)}
                >&#x270E;</button>
            ),
            editorCellRenderer: cellEditHandler
        }
    ];
    useEffect(() => {
        axios.get('http://localhost:8181/users').then(result => { setTableData(result.data) }).catch(() => setTableData([]));
    }, []);


    return (<div style={{ textAlign: "center" }}><GridTable columns={columns} rows={tableData} style={{ width: '99%' }} id="maingrid" data-testid="maingrid" />
        <button onClick={exportToCSV}>Export to CSV</button>
    </div>);
};

export default UserGrid;