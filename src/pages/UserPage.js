import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name, user) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
    setSelectedUser(user);
  };

  const handleDelete = () => {
    const newSelected = [...selected];
    const deleteUser = (name) => {
      const selectedIndex = newSelected.indexOf(name);
      newSelected.splice(selectedIndex, 1);
      setSelected(newSelected);
    };
    selected.map((name) => deleteUser(name));
    handleCloseMenu();
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <Helmet>
        <title>User | Minimal-UI</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            User
          </Typography>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onDelete={handleDelete}
          />
        </Stack>

        <Card>
          <UserListHead
            order={order}
            orderBy={orderBy}
            headLabel={TABLE_HEAD}
            rowCount={USERLIST.length}
            numSelected={selected.length}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAllClick}
            open={open}
            onClick={handleClick}
            onClose={handleCloseMenu}
            onDelete={handleDelete}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name, role, company, avatarUrl, isVerified, status } = row;
                    const isItemSelected = selected.indexOf(name) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, name, row)} />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Box
                            sx={{
                              py: 2,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Avatar alt={name} src={avatarUrl} sx={{ mr: 2 }} />
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="left">{company}</TableCell>
                        <TableCell align="left">{sentenceCase(role)}</TableCell>
                        <TableCell align="left">
                          <Label variant={isVerified ? 'ghost' : 'filled'} color={isVerified ? 'success' : 'error'}>
                            {isVerified ? 'Verified' : 'Unverified'}
                          </Label>
                        </TableCell>
                        <TableCell align="left">
                          <Label
                            variant={status === 'banned' ? 'ghost' : 'filled'}
                            color={status === 'banned' ? 'error' : 'success'}
                          >
                            {sentenceCase(status)}
                          </Label>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(clickEvent) => handleClick(clickEvent, name, row)}>
                            <Iconify icon="ic:outline-visibility" width={20} height={20} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Modal open={Boolean(selectedUser)} onClose={handleCloseModal}>
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Details
          </Typography>
          {selectedUser && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" gutterBottom>
                  Name: {selectedUser.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" gutterBottom>
                  Role: {selectedUser.role}
                </Typography>
              </AccordionDetails>
              <AccordionDetails>
                <Typography variant="body2" gutterBottom>
                  Company: {selectedUser.company}
                </Typography>
              </AccordionDetails>
              <AccordionDetails>
                <Typography variant="body2" gutterBottom>
                  Status: {sentenceCase(selectedUser.status)}
                </Typography>
              </AccordionDetails>
              <AccordionDetails>
                <Typography variant="body2" gutterBottom>
                  Verified: {selectedUser.isVerified ? 'Yes' : 'No'}
                </Typography>
              </AccordionDetails>
              <AccordionDetails>
                <Avatar alt={selectedUser.name} src={selectedUser.avatarUrl} sx={{ mt: 2 }} />
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </Modal>
    </>
  );
}
