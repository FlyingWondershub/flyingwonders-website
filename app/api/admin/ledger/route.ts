import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../../../sanity/env'

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

// POST: Admin records a new payment, adds an extra charge, or updates invoice status
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { proposalNumber, adminEmail, action, paymentData, chargeData, invoiceNumber, status } = body

    // Security Check: Only Flying Wonders Admin can access ledger mutations
    if (!adminEmail || adminEmail.toLowerCase() !== 'info.flyingwonders@gmail.com') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 })
    }

    if (!proposalNumber) {
      return NextResponse.json({ success: false, error: 'Proposal number is required.' }, { status: 400 })
    }

    // Fetch existing proposal document
    const proposal = await writeClient.fetch(`*[_type == "proposal" && proposalNumber == $proposalNumber][0]`, { proposalNumber })
    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Proposal not found.' }, { status: 404 })
    }

    let updatedDoc: any = {}

    if (action === 'add_payment') {
      // paymentData: { amount, method, referenceNo, notes }
      const newPayment = {
        paymentId: `PAY-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        amount: Number(paymentData.amount) || 0,
        method: paymentData.method || 'Bank Transfer',
        referenceNo: paymentData.referenceNo || '',
        notes: paymentData.notes || '',
        recordedBy: adminEmail,
      }
      const existingLedger = Array.isArray(proposal.paymentLedger) ? proposal.paymentLedger : []
      const updatedLedger = [...existingLedger, newPayment]

      // Auto-assign invoice number if not assigned yet
      let autoInv = proposal.invoiceNumber
      let autoInvDate = proposal.invoiceDate
      if (!autoInv) {
        autoInv = `INV-${new Date().getFullYear()}-${proposalNumber.split('-').pop() || '0001'}`
        autoInvDate = new Date().toISOString().split('T')[0]
      }

      updatedDoc = await writeClient.patch(proposal._id).set({
        paymentLedger: updatedLedger,
        invoiceNumber: autoInv,
        invoiceDate: autoInvDate,
      }).commit()

    } else if (action === 'delete_payment') {
      const existingLedger = Array.isArray(proposal.paymentLedger) ? proposal.paymentLedger : []
      const updatedLedger = existingLedger.filter((p: any) => p.paymentId !== paymentData?.paymentId)

      updatedDoc = await writeClient.patch(proposal._id).set({
        paymentLedger: updatedLedger,
      }).commit()

    } else if (action === 'add_charge') {
      // chargeData: { itemDescription, amount, chargeType }
      const newCharge = {
        chargeId: `CHG-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        itemDescription: chargeData.itemDescription || 'Additional Service',
        amount: Number(chargeData.amount) || 0,
        chargeType: chargeData.chargeType || 'Add-On',
        addedBy: adminEmail,
      }
      const existingCharges = Array.isArray(proposal.additionalCharges) ? proposal.additionalCharges : []
      const updatedCharges = [...existingCharges, newCharge]

      updatedDoc = await writeClient.patch(proposal._id).set({
        additionalCharges: updatedCharges,
      }).commit()

    } else if (action === 'delete_charge') {
      const existingCharges = Array.isArray(proposal.additionalCharges) ? proposal.additionalCharges : []
      const updatedCharges = existingCharges.filter((c: any) => c.chargeId !== chargeData?.chargeId)

      updatedDoc = await writeClient.patch(proposal._id).set({
        additionalCharges: updatedCharges,
      }).commit()

    } else if (action === 'update_status') {
      let patchData: any = {}
      if (status) patchData.status = status
      if (invoiceNumber) patchData.invoiceNumber = invoiceNumber
      
      // Auto assign invoice number on confirmation if missing
      if (status === 'confirmed' && !proposal.invoiceNumber && !invoiceNumber) {
        patchData.invoiceNumber = `INV-${new Date().getFullYear()}-${proposalNumber.split('-').pop() || '0001'}`
        patchData.invoiceDate = new Date().toISOString().split('T')[0]
      }

      updatedDoc = await writeClient.patch(proposal._id).set(patchData).commit()
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      proposalNumber: proposal.proposalNumber,
      proposal: updatedDoc,
    })

  } catch (err: any) {
    console.error('Ledger API error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
