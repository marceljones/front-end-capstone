import React, { useContext, useEffect, useState } from "react"
import { Button } from "semantic-ui-react"
import { CelebrationContext } from "../celebration/CelebrationProvider"
import { BudgetContext } from "./BudgetProvider"
import { useParams, useHistory } from "react-router-dom"
import { GiftContext } from "../gift/GiftProvider"

export const BudgetForm = () => {
    const { updateBudget, addBudget, getBudgetById } = useContext(BudgetContext)
    const { getCelebrationsByUserId, celebrations, getCelebrationById } = useContext(CelebrationContext)
    const { getGiftsByCelebrationId } = useContext(GiftContext)
    const userId = parseInt(localStorage.getItem("cs_user"))

    const [budget, setBudget] = useState({})
    const [celebration, setCelebration] = useState({})
    const [celebrationGifts, setCelebrationGifts] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory()

    const {budgetId} = useParams()

    useEffect(() => {
        getCelebrationsByUserId(userId)
        .then(() => {
            if (budgetId) {
                getBudgetById(budgetId).then(setBudget)
            } else {
                setIsLoading(false)
            }
        })
    }, [])

    useEffect(() => {
        if (budget.celebration?.id) {
            getCelebrationById(budget.celebration.id).then(celebration => {
                delete budget.celebration
                setCelebration(celebration)
            })
        }
    }, [budget])

    useEffect(() => {
        if (celebration.id) {
            getGiftsByCelebrationId(celebration.id).then(res => {
                setCelebrationGifts(res)
                setIsLoading(false)
            })
        }
    }, [celebration])
    
    const handleControlledInputChange = (event) => {
        const newBudget = { ...budget }
        newBudget[event.target.name] = event.target.value
        setBudget(newBudget)
    }

    const handleDropdownChange = (event) => {
        const newBudget = { ...budget }
        
        newBudget[event.target.name] = event.target.value
        setBudget(newBudget)
        getCelebrationById(event.target.value).then(setCelebration)
    }

    const constructBudgetObject = () => {
        const boughtGifts = celebrationGifts?.map(cg => {
            return cg.giftList.forSelf === false ? cg.price : null
        })
        
        const amountSpent = boughtGifts.length > 0 ? boughtGifts.reduce((a,b) => a + b) : 0

        setIsLoading(false);

        if (budgetId) {
            updateBudget({
                id: parseInt(budgetId),
                name: budget.name,
                total: parseInt(budget.total),
                spent: amountSpent,
                celebrationId: parseInt(budget.celebrationId)
                
            })
            .then(() => history.push(`/budgets/table/${budgetId}`))
        } else {
            addBudget({
                name: budget.name,
                total: parseInt(budget.total),
                spent: amountSpent,
                celebrationId: parseInt(budget.celebrationId)
            })
            .then(() => {
                history.push(`/budgets`)
            })
        }
    }

    return (
        <section className="budgetContainer">
            <div className="container--budget">
            <form className="form--budget" onSubmit={evt => {
                evt.preventDefault() // Prevent browser from submitting the form
                constructBudgetObject()
            }}>
                <h2 className="budgetForm__title">
                    {budgetId ? "Update Budget" : "New Budget"}
                </h2>
                <fieldset>
                    <div className="form-group">
                        <label htmlFor="budgetName">Budget name: </label>
                        <input type="text" id="budgetName" name="name" required autoFocus 
                        className="form-control" placeholder="Budget name..." 
                        onChange={handleControlledInputChange} 
                        defaultValue={budget.name}/>
                    </div>
                </fieldset>
                <fieldset>
                    <div className="form-group">
                        <label htmlFor="total">Budget total: </label>
                        <input type="number" id="total" name="total" required
                        className="form-control" placeholder="Budget total..." 
                        onChange={handleControlledInputChange} 
                        defaultValue={budget.total}/>
                    </div>
                </fieldset>
                <fieldset>
                    <div className="form-group">
                        <label htmlFor="celebrationId">Celebration for budget:</label>
                        <select id="celebrationId" className="form-control" name="celebrationId" value={celebration.id} onChange={handleDropdownChange} required>
                            <option value="" hidden>Please select a celebration...</option>
                            {
                                celebrations?.map(celebration => {
                                    return <option key={celebration.id} value={celebration.id}>{celebration.name}</option>
                                })
                            }
                        </select>
                    </div>
                </fieldset>
                <div className="budgetForm-buttons">
                    <Button primary type="submit"
                        disabled = {isLoading}
                        className="btn btn-primary">
                        {budgetId ? "Save Budget" : "Add Budget"}
                    </Button>
                    <Button type="button" onClick={() => {
                        budgetId ? history.push(`/budgets/table/${budgetId}`) : history.push("/budgets")
                    }}>Cancel</Button>
                </div>
            </form>
            </div>
        </section>
    )
}