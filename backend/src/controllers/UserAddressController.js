const UserAddressModel = require('../models/UserAddressModel');

class UserAddressController {
  /**
   * Get all addresses for current user
   * GET /api/users/addresses
   */
  static async getAllAddresses(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const addresses = await UserAddressModel.findByUserId(userId);
      res.json({ success: true, addresses });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch addresses' });
    }
  }

  /**
   * Get default address for current user
   * GET /api/users/addresses/default
   */
  static async getDefaultAddress(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const address = await UserAddressModel.findDefaultByUserId(userId);
      res.json({ success: true, address });
    } catch (error) {
      console.error('Error fetching default address:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch default address' });
    }
  }

  /**
   * Create new address
   * POST /api/users/addresses
   */
  static async createAddress(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { recipient_name, phone, address, is_default } = req.body;

      // Validation
      if (!recipient_name || !phone || !address) {
        return res.status(400).json({
          success: false,
          error: 'Recipient name, phone, and address are required'
        });
      }

      if (recipient_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Recipient name cannot be empty'
        });
      }

      if (address.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Address cannot be empty'
        });
      }

      const newAddress = await UserAddressModel.create({
        user_id: userId,
        recipient_name: recipient_name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        is_default: is_default || false
      });

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        address: newAddress
      });
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ success: false, error: 'Failed to create address' });
    }
  }

  /**
   * Update address
   * PUT /api/users/addresses/:id
   */
  static async updateAddress(req, res) {
    try {
      const userId = req.user?.id;
      const addressId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Verify ownership
      const isOwner = await UserAddressModel.verifyOwnership(addressId, userId);
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Address not found or access denied' });
      }

      const { recipient_name, phone, address, is_default } = req.body;

      // Validation
      if (!recipient_name || !phone || !address) {
        return res.status(400).json({
          success: false,
          error: 'Recipient name, phone, and address are required'
        });
      }

      const updatedAddress = await UserAddressModel.update(addressId, {
        user_id: userId,
        recipient_name: recipient_name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        is_default: is_default || false
      });

      res.json({
        success: true,
        message: 'Address updated successfully',
        address: updatedAddress
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ success: false, error: 'Failed to update address' });
    }
  }

  /**
   * Set address as default
   * PUT /api/users/addresses/:id/set-default
   */
  static async setDefaultAddress(req, res) {
    try {
      const userId = req.user?.id;
      const addressId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Verify ownership
      const isOwner = await UserAddressModel.verifyOwnership(addressId, userId);
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Address not found or access denied' });
      }

      const updatedAddress = await UserAddressModel.setAsDefault(addressId, userId);

      res.json({
        success: true,
        message: 'Default address updated successfully',
        address: updatedAddress
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({ success: false, error: 'Failed to set default address' });
    }
  }

  /**
   * Delete address
   * DELETE /api/users/addresses/:id
   */
  static async deleteAddress(req, res) {
    try {
      const userId = req.user?.id;
      const addressId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Verify ownership
      const isOwner = await UserAddressModel.verifyOwnership(addressId, userId);
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Address not found or access denied' });
      }

      // Check if it's the default address
      const address = await UserAddressModel.findById(addressId);
      if (address && address.is_default) {
        // Check if there are other addresses
        const allAddresses = await UserAddressModel.findByUserId(userId);
        if (allAddresses.length > 1) {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete default address. Please set another address as default first.'
          });
        }
      }

      const deleted = await UserAddressModel.delete(addressId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Address not found' });
      }

      res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ success: false, error: 'Failed to delete address' });
    }
  }
}

module.exports = UserAddressController;




