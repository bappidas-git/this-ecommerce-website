import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { PRODUCT_STATUS } from '../../features/products/productStatus.js';

function ProductRowActions({
  product,
  canWrite,
  onView,
  onEdit,
  onDuplicate,
  onArchive,
  onUnarchive,
  onDelete,
}) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const isArchived = product?.status === PRODUCT_STATUS.archived;

  const close = () => setAnchor(null);

  return (
    <>
      <IconButton
        aria-label={`Actions for ${product?.name || 'product'}`}
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
      >
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ dense: true }}
      >
        <MenuItem
          onClick={() => {
            close();
            onView?.(product);
          }}
        >
          <OpenInNewRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          View on storefront
        </MenuItem>
        <MenuItem
          onClick={() => {
            close();
            onEdit?.(product);
          }}
        >
          <EditRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        {canWrite ? (
          <MenuItem
            onClick={() => {
              close();
              onDuplicate?.(product);
            }}
          >
            <ContentCopyRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
            Duplicate
          </MenuItem>
        ) : null}
        {canWrite ? <Divider /> : null}
        {canWrite && !isArchived ? (
          <MenuItem
            onClick={() => {
              close();
              onArchive?.(product);
            }}
          >
            <ArchiveRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
            Archive
          </MenuItem>
        ) : null}
        {canWrite && isArchived ? (
          <MenuItem
            onClick={() => {
              close();
              onUnarchive?.(product);
            }}
          >
            <UnarchiveRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
            Unarchive
          </MenuItem>
        ) : null}
        {canWrite ? (
          <MenuItem
            onClick={() => {
              close();
              onDelete?.(product);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}

export default ProductRowActions;
